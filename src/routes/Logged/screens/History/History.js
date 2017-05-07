// @flow

import './History.scss';

import React, { Component } from 'react';
import moment from 'moment';
import cx from 'classnames';
import { Link } from 'react-router-dom';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import orderBy from 'lodash/orderBy';

import Avatar from 'components/Avatar';
import SideMenu from 'components/SideMenu';

import { getActions, removeActions } from 'utils/database.v2';

import type { ActionType } from 'types/action';

type PropsType = {
  match: Object,
}

const filterTypesMap = [
  { text: 'All', type: '' },
  { text: 'Liked', type: 'like' },
  { text: 'Superliked', type: 'superlike' },
  { text: 'Passed', type: 'pass' },
];

@observer
class Actions extends Component {
  props: PropsType;
  actions: Array<ActionType> = [];

  @observable filter = '';

  constructor() {
    super();

    this.actions = getActions();
  }

  filterAll(): Array<ActionType> {
    return orderBy(this.actions.filter(action => action.name), action => (
      moment(action.date).format('X')
    ), 'desc');
  }

  filterType(type: string) {
    return this.filterAll().filter(action => action.action_type === type);
  }

  handleFilter = (type: string) => () => {
    this.filter = type;
  }

  handleClear = () => {
    removeActions();
    this.actions = [];
    this.forceUpdate();
  }

  getFiltered() {
    switch(this.filter) {
      case 'like': return this.filterType('like')
      case 'superlike': return this.filterType('superlike')
      case 'pass': return this.filterType('pass')
      default: return this.filterAll();
    }
  }

  render() {
    const filtered = this.getFiltered();

    return (
      <div className="history">
        <SideMenu title="History">
          {filterTypesMap.map(filter => (
            <SideMenu.Item
              key={filter.text}
              active={this.filter === filter.type}
              rightText={filter.type ? this.filterType(filter.type).length : this.filterAll().length}
              onClick={this.handleFilter(filter.type)}
              className="history__sidemenu-item"
            >
              <span>{filter.text}</span>
            </SideMenu.Item>
          ))}
          <SideMenu.Separator />
          <SideMenu.Item asAction onClick={this.handleClear}>
            <i className="fa fa-trash" /> Clear
          </SideMenu.Item>
        </SideMenu>
        <SideMenu.Right>
          <div className="history__content">
            {filtered.map(action => (
              <Link to={`/user/${action.person_id}`} key={action._id} className={cx('history__person', {
                'history__person--super': action.action_type === 'superlike',
                'history__person--like': action.action_type === 'like',
                'history__person--pass': action.action_type === 'pass',
              })}>
                <Avatar url={action.photo} />
                <div className="history__person-name">{action.name}</div>
                <div className="history__person-date">{moment(action.date).fromNow()}</div>
              </Link>
            ))}
          </div>
        </SideMenu.Right>
      </div>
    );
  }
}

export default Actions;
