// @flow

import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { last, uniqueId } from 'lodash';
import moment from 'moment';

import Message from '../Message';
import MessageStore from 'stores/MessageStore';
import Person from 'models/Person';
import { CurrentUser } from 'models/CurrentUser';

type PropsTypes = {
  messageStore: MessageStore,
  currentUser: CurrentUser,
};

type GetAuthorType = Person | CurrentUser;

const getAuthor = (fromId: string, interlocutor: Person, currentUser: CurrentUser): GetAuthorType => {
  return fromId === currentUser._id ? currentUser : interlocutor;
}

class MessageList extends Component {
  props: PropsTypes;

  messagesRefs: Array<*> = [];

  componentDidMount() {
    this.scrollIntoView()
  }

  componentDidUpdate() {
    this.scrollIntoView()
  }

  scrollIntoView() {
    const { messageStore, currentUser } = this.props;

    const lastMessage = last(this.messagesRefs);

    if (lastMessage) {
      lastMessage.scrollIntoView()
    }
  }

  render() {
    const { messageStore, currentUser } = this.props;
    let gorupMessage = false;

    return (
      <div>
        {messageStore.messages.map((message, i) => {
          const component = (
            <Message
              group={gorupMessage}
              key={message._id || uniqueId()}
              ref={ref => { this.messagesRefs.push(ref) }}
              message={message}
              onRemove={messageStore.removeMessage}
              author={getAuthor(message.from_id, messageStore.interlocutor, currentUser)}
            />
          );

          const next = messageStore.messages[i + 1];

          if (next) {
            const firstTime = message.sendDate;
            const nextTime = next.sendDate;
            const dur = moment.duration(nextTime.diff(firstTime));
            if (dur.asMinutes() < 1 && message.from_id === next.from_id) {
              gorupMessage = true;
            } else {
              gorupMessage = false;
            }
          }

          return component;
        }
        )}
      </div>
    )
  }
}

export default inject('currentUser')(observer(MessageList));
