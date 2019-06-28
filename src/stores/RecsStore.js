import { observable, computed, reaction, action } from 'mobx';
import map from 'lodash/map';
import find from 'lodash/find';
import each from 'lodash/each';
import filter from 'lodash/filter';

import { get } from 'utils/api';
import { removeAction } from 'utils/database.v2';
import Person from 'models/Person';

export type FiltersType = 'all' | 'insta' | 'bio' | 'interests' | 'friends';

class RecsStore {
  loadMoreHandler = null;

  @observable persons: Array<Person> = [];
  @observable fastMatchedPersons: Array<Person> = [];
  @observable is_fetching: boolean = false;
  @observable is_fetching_fast_match: boolean = false;
  @observable is_loading_more: boolean = false;
  @observable isError: boolean = false;
  @observable visibilityFilter: FiltersType = 'all';

  constructor() {
    this.loadMoreHandler = reaction(
      () => this.allVisible.length,
      length => {
        if (length <= 3 && !this.is_fetching && !this.is_loading_more) {
          this.fetchCore(true);
        }
      },
    );
  }

  @action
  async fetchCore(asLoadMore: boolean = false) {
    if (this.allVisible.length > 3 && !asLoadMore) {
      return;
    }

    if (asLoadMore) {
      this.is_loading_more = true;
    } else {
      this.is_fetching = true;
    }

    try {
      const { data } = await get('/v2/recs/core');

      const results = data.data.results;
      if (results.length > 0) {
        each(results, json => this.setPerson({ ...json.user, distance_mi: json.distance_mi }));
      }
    } catch (e) {
      this.isError = true;
    }

    this.is_fetching = false;
    this.is_loading_more = false;
  }

  @action
  async fetchFastMatch() {
    this.is_fetching_fast_match = true;
    try {
      const { data } = await get('/v2/fast-match/teasers');

      this.fastMatchedPersons = data.data.results.map(result => new Person(this, {
        _id: result.user._id,
        photos: result.user.photos,
        name: 'n/a',
        is_fast_match_found: true,
        hide_age: true,
      }));
    } catch (e) {
      this.isError = true;
      console.log('Error:', e);
    }

    this.is_fetching_fast_match = false;
  }

  @action
  setPerson(json, force = false) {
    const existingPerson = find(this.persons, { _id: json._id });
    const person = new Person(this, json);

    if (existingPerson) {
      if (force) {
        this.persons.replace([person]);
      }
      return;
    }

    this.persons.push(person);
  }

  @action
  revert(_id: string) {
    const person = this.persons.find(p => p._id === _id);

    if (person) {
      person.is_done = 0;
      removeAction(_id);
    }
  }

  @computed
  get allVisible(): Array<Person> {
    return filter(this.persons, p => {
      let cond = true;

      switch (this.visibilityFilter) {
        case 'insta':
          cond = !!p.instagramProfileLink;
          break;
        case 'bio':
          cond = p.bio && p.bio.length;
          break;
        case 'interests':
          cond = p.common_interests && p.common_interests.length;
          break;
        case 'friends':
          cond = p.common_connections && p.common_connections.length;
          break;
        default:
      }

      return cond && p.is_done === 0;
    });
  }

  @computed
  get fastMatched() {
    return this.fastMatchedPersons;
  }

  @computed
  get fastMatchCount(): number {
    return this.fastMatched.length;
  }

  @computed
  get areRecsExhaust(): boolean {
    return !this.is_fetching && this.allVisible.length === 0;
  }
}

export default new RecsStore();
