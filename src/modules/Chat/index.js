import { clearUnreadAction } from '../../containers/HomePageList/homePageListAction';
import { addGroupMessagesAction } from '../../containers/GroupChatPage/groupChatAction';
import { addPrivateChatMessagesAction } from '../../containers/PrivateChatPage/privateChatAction';
import store from '../../redux/store';
import notification from '../../components/Notification';

export default class Chat {
  constructor() {
    this._hasLoadAllMessages = false;
  }

  scrollToBottom(time = 0) {
    const ulDom = document.getElementsByClassName('chat-content-list')[0];
    if (ulDom) {
      setTimeout(() => {
        ulDom.scrollTop = ulDom.scrollHeight + 10000;
      }, time);
    }
  }

  clearUnreadHandle({ homePageList, chatFromId }) {
    store.dispatch(clearUnreadAction({ homePageList, chatFromId }));
  }

  lazyLoadGroupMessages({
    chats, chatId, start, count
  }) {
    if (!this._hasLoadAllMessages) {
      window.socket.emit('getOneGroupMessages', { groupId: chatId, start, count }, (groupMessages) => {
        if (groupMessages && groupMessages.length === 0) {
          this._hasLoadAllMessages = true;
          notification('已经到底啦', 'warn', 2);
          return;
        }
        store.dispatch(addGroupMessagesAction({
          allGroupChats: chats, messages: groupMessages, groupId: chatId, inLazyLoading: true
        }));
      });
    }
  }

  lazyLoadPrivateChatMessages({
    chats, userId, chatId, start, count
  }) {
    if (!this._hasLoadAllMessages) {
      window.socket.emit('getOnePrivateChatMessages', {
        userId, toUser: chatId, start, count
      }, (privateChatMessages) => {
        if (privateChatMessages && privateChatMessages.length === 0) {
          this._hasLoadAllMessages = true;
          notification('已经到底啦', 'warn', 2);
          return;
        }
        store.dispatch(addPrivateChatMessagesAction({
          allPrivateChats: chats, messages: privateChatMessages, chatId, inLazyLoading: true
        }));
      });
    }
  }

  get isScrollInBottom() {
    const ulDom = document.getElementsByClassName('chat-content-list')[0];
    if (ulDom) {
      return (ulDom.scrollTop + ulDom.clientHeight) === ulDom.scrollHeight;
    }
    return false;
  }
}