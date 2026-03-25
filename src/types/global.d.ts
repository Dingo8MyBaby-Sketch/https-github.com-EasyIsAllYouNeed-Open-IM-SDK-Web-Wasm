declare class Go {
  importObject: WebAssembly.Imports;
  exited: boolean;
  run(instance: WebAssembly.Instance): Promise<void>;
}

interface Window {
  // SDK initialization
  initSDK: (operationID: string, config: string) => void;
  login: (operationID: string, userID: string, token: string) => Promise<string>;
  logout: (operationID: string) => Promise<string>;

  // Event listener
  commonEventFunc: (callback: (event: string) => void) => void;

  // File operations
  fileMapSet: (...args: unknown[]) => Promise<unknown>;
  fileMapClear: (...args: unknown[]) => Promise<unknown>;

  // Conversation
  getAllConversationList: (operationID: string) => Promise<string>;
  getOneConversation: (
    operationID: string,
    sessionType: number,
    sourceID: string
  ) => Promise<string>;
  getMultipleConversation: (
    operationID: string,
    conversationIDs: string
  ) => Promise<string>;
  deleteConversationAndDeleteAllMsg: (
    operationID: string,
    conversationID: string
  ) => Promise<string>;
  markConversationMessageAsRead: (
    operationID: string,
    conversationID: string
  ) => Promise<string>;
  setConversation: (
    operationID: string,
    conversationID: string,
    req: string
  ) => Promise<string>;
  setConversationMsgDestructTime: (
    operationID: string,
    conversationID: string,
    msgDestructTime: number
  ) => Promise<string>;
  setConversationIsMsgDestruct: (
    operationID: string,
    conversationID: string,
    isMsgDestruct: boolean
  ) => Promise<string>;
  pinConversation: (
    operationID: string,
    conversationID: string,
    isPinned: boolean
  ) => Promise<string>;
  setConversationRecvMessageOpt: (
    operationID: string,
    conversationID: string,
    opt: number
  ) => Promise<string>;
  setConversationPrivateChat: (
    operationID: string,
    conversationID: string,
    isPrivate: boolean
  ) => Promise<string>;
  setConversationBurnDuration: (
    operationID: string,
    conversationID: string,
    burnDuration: number
  ) => Promise<string>;
  setConversationEx: (
    operationID: string,
    conversationID: string,
    ex: string
  ) => Promise<string>;
  getTotalUnreadMsgCount: (operationID: string) => Promise<string>;
  getConversationIDBySessionType: (
    operationID: string,
    sourceID: string,
    sessionType: number
  ) => Promise<string>;
  setConversationDraft: (
    operationID: string,
    conversationID: string,
    draftText: string
  ) => Promise<string>;
  resetConversationGroupAtType: (
    operationID: string,
    conversationID: string
  ) => Promise<string>;
  getInputStates: (
    operationID: string,
    conversationID: string,
    userID: string
  ) => Promise<string>;
  changeInputStates: (
    operationID: string,
    conversationID: string,
    focus: boolean
  ) => Promise<string>;
  getAtAllTag: (operationID: string) => Promise<string>;

  // Message
  sendMessage: (
    operationID: string,
    message: string,
    recvID: string,
    groupID: string,
    offlinePushInfo: string,
    isOnlineOnly: boolean
  ) => Promise<string>;
  sendMessageNotOss: (
    operationID: string,
    message: string,
    recvID: string,
    groupID: string,
    offlinePushInfo: string,
    isOnlineOnly: boolean
  ) => Promise<string>;
  getAdvancedHistoryMessageList: (
    operationID: string,
    params: string
  ) => Promise<string>;
  getAdvancedHistoryMessageListReverse: (
    operationID: string,
    params: string
  ) => Promise<string>;
  revokeMessage: (
    operationID: string,
    conversationID: string,
    clientMsgID: string
  ) => Promise<string>;
  setMessageLocalEx: (
    operationID: string,
    conversationID: string,
    clientMsgID: string,
    localEx: string
  ) => Promise<string>;
  deleteMessage: (
    operationID: string,
    conversationID: string,
    clientMsgID: string
  ) => Promise<string>;
  deleteAllMsgFromLocalAndSvr: (operationID: string) => Promise<string>;
  deleteAllMsgFromLocal: (operationID: string) => Promise<string>;
  clearConversationAndDeleteAllMsg: (
    operationID: string,
    conversationID: string
  ) => Promise<string>;
  insertSingleMessageToLocalStorage: (
    operationID: string,
    message: string,
    recvID: string,
    sendID: string
  ) => Promise<string>;
  insertGroupMessageToLocalStorage: (
    operationID: string,
    message: string,
    groupID: string,
    sendID: string
  ) => Promise<string>;
  typingStatusUpdate: (
    operationID: string,
    recvID: string,
    msgTip: string
  ) => Promise<string>;
  markMessagesAsReadByMsgID: (
    operationID: string,
    conversationID: string,
    clientMsgIDs: string
  ) => Promise<string>;
  sendGroupMessageReadReceipt: (
    operationID: string,
    conversationID: string,
    clientMsgIDList: string
  ) => Promise<string>;
  getGroupMessageReaderList: (
    operationID: string,
    conversationID: string,
    clientMsgID: string,
    filter: number,
    offset: number,
    count: number
  ) => Promise<string>;
  searchLocalMessages: (
    operationID: string,
    params: string
  ) => Promise<string>;
  getAdvancedHistoryMsg: (
    operationID: string,
    params: string
  ) => Promise<string>;
  findMessageList: (operationID: string, params: string) => Promise<string>;

  // Create message methods
  createTextMessage: (operationID: string, text: string) => Promise<string>;
  createTextAtMessage: (
    operationID: string,
    text: string,
    atUserIDList: string,
    atUsersInfo: string,
    message: string
  ) => Promise<string>;
  createAdvancedTextMessage: (
    operationID: string,
    text: string,
    messageEntityList: string
  ) => Promise<string>;
  createAdvancedQuoteMessage: (
    operationID: string,
    text: string,
    message: string,
    messageEntityList: string
  ) => Promise<string>;
  createImageMessageByURL: (
    operationID: string,
    sourcePicture: string,
    bigPicture: string,
    snapshotPicture: string
  ) => Promise<string>;
  createVideoMessageByURL: (
    operationID: string,
    videoInfo: string
  ) => Promise<string>;
  createSoundMessageByURL: (
    operationID: string,
    soundInfo: string
  ) => Promise<string>;
  createFileMessageByURL: (
    operationID: string,
    fileInfo: string
  ) => Promise<string>;
  createMergerMessage: (
    operationID: string,
    messageList: string,
    title: string,
    summaryList: string
  ) => Promise<string>;
  createFaceMessage: (
    operationID: string,
    index: number,
    data: string
  ) => Promise<string>;
  createLocationMessage: (
    operationID: string,
    description: string,
    longitude: number,
    latitude: number
  ) => Promise<string>;
  createCustomMessage: (
    operationID: string,
    data: string,
    extension: string,
    description: string
  ) => Promise<string>;
  createQuoteMessage: (
    operationID: string,
    text: string,
    message: string
  ) => Promise<string>;
  createCardMessage: (
    operationID: string,
    cardInfo: string
  ) => Promise<string>;

  // User
  getSelfUserInfo: (operationID: string) => Promise<string>;
  setSelfInfo: (operationID: string, userInfo: string) => Promise<string>;
  getUsersInfoWithCache: (
    operationID: string,
    userIDList: string,
    groupID: string
  ) => Promise<string>;
  subscribeUsersStatus: (
    operationID: string,
    userIDList: string
  ) => Promise<string>;
  unsubscribeUsersStatus: (
    operationID: string,
    userIDList: string
  ) => Promise<string>;
  getSubscribeUsersStatus: (operationID: string) => Promise<string>;
  getUserStatus: (
    operationID: string,
    userIDList: string
  ) => Promise<string>;
  setAppBackgroundStatus: (
    operationID: string,
    isBackground: boolean
  ) => Promise<string>;
  networkStatusChanged: (operationID: string) => Promise<string>;
  getLoginStatus: (operationID: string) => Promise<string>;
  getLoginUserID: (operationID: string) => Promise<string>;

  // Friend
  acceptFriendApplication: (
    operationID: string,
    userID: string,
    handleMsg: string
  ) => Promise<string>;
  refuseFriendApplication: (
    operationID: string,
    userID: string,
    handleMsg: string
  ) => Promise<string>;
  addFriend: (
    operationID: string,
    toUserID: string,
    reqMsg: string
  ) => Promise<string>;
  getFriendApplicationListAsApplicant: (
    operationID: string
  ) => Promise<string>;
  getFriendApplicationListAsRecipient: (
    operationID: string
  ) => Promise<string>;
  getAllFriendList: (operationID: string) => Promise<string>;
  searchFriends: (operationID: string, params: string) => Promise<string>;
  getSpecifiedFriendsInfo: (
    operationID: string,
    userIDList: string
  ) => Promise<string>;
  deleteFriend: (operationID: string, toUserID: string) => Promise<string>;
  checkFriend: (operationID: string, userIDList: string) => Promise<string>;
  setFriendRemark: (
    operationID: string,
    toUserID: string,
    remark: string
  ) => Promise<string>;
  pinFriends: (operationID: string, params: string) => Promise<string>;
  setFriendsEx: (operationID: string, params: string) => Promise<string>;
  updateFriends: (operationID: string, params: string) => Promise<string>;

  // Group
  createGroup: (operationID: string, params: string) => Promise<string>;
  joinGroup: (
    operationID: string,
    groupID: string,
    reqMsg: string,
    joinSource: number,
    ex: string
  ) => Promise<string>;
  quitGroup: (operationID: string, groupID: string) => Promise<string>;
  getJoinedGroupList: (operationID: string) => Promise<string>;
  getSpecifiedGroupsInfo: (
    operationID: string,
    groupIDList: string
  ) => Promise<string>;
  searchGroups: (operationID: string, params: string) => Promise<string>;
  setGroupInfo: (
    operationID: string,
    groupID: string,
    groupInfo: string
  ) => Promise<string>;
  getGroupApplicationListAsApplicant: (operationID: string) => Promise<string>;
  getGroupApplicationListAsRecipient: (operationID: string) => Promise<string>;
  acceptGroupApplication: (
    operationID: string,
    groupID: string,
    fromUserID: string,
    handleMsg: string
  ) => Promise<string>;
  refuseGroupApplication: (
    operationID: string,
    groupID: string,
    fromUserID: string,
    handleMsg: string
  ) => Promise<string>;
  transferGroupOwner: (
    operationID: string,
    groupID: string,
    newOwnerUserID: string
  ) => Promise<string>;
  dismissGroup: (operationID: string, groupID: string) => Promise<string>;
  changeGroupMute: (
    operationID: string,
    groupID: string,
    isMute: boolean
  ) => Promise<string>;
  changeGroupMemberMute: (
    operationID: string,
    groupID: string,
    userID: string,
    mutedSeconds: number
  ) => Promise<string>;
  setGroupMemberInfo: (
    operationID: string,
    groupID: string,
    userID: string,
    groupMemberInfo: string
  ) => Promise<string>;
  setGroupVerification: (
    operationID: string,
    groupID: string,
    verification: number
  ) => Promise<string>;
  setGroupLookMemberInfo: (
    operationID: string,
    groupID: string,
    rule: number
  ) => Promise<string>;
  setGroupApplyMemberFriend: (
    operationID: string,
    groupID: string,
    rule: number
  ) => Promise<string>;
  getGroupMemberList: (
    operationID: string,
    groupID: string,
    filter: number,
    offset: number,
    count: number
  ) => Promise<string>;
  getGroupMemberOwnerAndAdmin: (
    operationID: string,
    groupID: string
  ) => Promise<string>;
  getGroupMemberListByJoinTimeFilter: (
    operationID: string,
    groupID: string,
    offset: number,
    count: number,
    joinTimeBegin: number,
    joinTimeEnd: number,
    filterUserIDList: string
  ) => Promise<string>;
  getSpecifiedGroupMembersInfo: (
    operationID: string,
    groupID: string,
    userIDList: string
  ) => Promise<string>;
  kickGroupMember: (
    operationID: string,
    groupID: string,
    reason: string,
    userIDList: string
  ) => Promise<string>;
  inviteUserToGroup: (
    operationID: string,
    groupID: string,
    reason: string,
    userIDList: string
  ) => Promise<string>;
  searchGroupMembers: (
    operationID: string,
    params: string
  ) => Promise<string>;
  isJoinGroup: (
    operationID: string,
    groupID: string
  ) => Promise<string>;
  setGroupMemberRoleLevel: (
    operationID: string,
    groupID: string,
    userID: string,
    roleLevel: number
  ) => Promise<string>;
  setGroupMemberNickname: (
    operationID: string,
    groupID: string,
    userID: string,
    groupMemberNickname: string
  ) => Promise<string>;
  getJoinedGroupListPage: (
    operationID: string,
    offset: number,
    count: number
  ) => Promise<string>;

  // Black
  addBlack: (
    operationID: string,
    toUserID: string,
    ex: string
  ) => Promise<string>;
  removeBlack: (operationID: string, toUserID: string) => Promise<string>;
  getBlackList: (operationID: string) => Promise<string>;

  // Signaling / RTC
  signalingInvite: (operationID: string, params: string) => Promise<string>;
  signalingInviteInGroup: (
    operationID: string,
    params: string
  ) => Promise<string>;
  signalingAccept: (operationID: string, params: string) => Promise<string>;
  signalingReject: (operationID: string, params: string) => Promise<string>;
  signalingCancel: (operationID: string, params: string) => Promise<string>;
  signalingHungUp: (operationID: string, params: string) => Promise<string>;
  signalingGetRoomByGroupID: (
    operationID: string,
    groupID: string
  ) => Promise<string>;
  signalingGetTokenByRoomID: (
    operationID: string,
    roomID: string
  ) => Promise<string>;
  customSignalingSend: (
    operationID: string,
    params: string
  ) => Promise<string>;
  signalingCreateMeeting: (
    operationID: string,
    params: string
  ) => Promise<string>;
  signalingJoinMeeting: (
    operationID: string,
    params: string
  ) => Promise<string>;

  // Upload
  uploadFile: (operationID: string, params: string) => Promise<string>;
  updateMsgSenderInfo: (
    operationID: string,
    nickname: string,
    faceURL: string
  ) => Promise<string>;
  uploadLogs: (
    operationID: string,
    line: number,
    ex: string
  ) => Promise<string>;

  // wasm sql storage
  wasmOpen: (...args: unknown[]) => Promise<unknown>;
  wasmClose: (...args: unknown[]) => Promise<unknown>;
  wasmRead: (...args: unknown[]) => Promise<unknown>;
  setSqlWasmPath: (...args: unknown[]) => Promise<unknown>;
  initDB: (...args: unknown[]) => Promise<unknown>;
  close: (...args: unknown[]) => Promise<unknown>;

  // message db ops
  getMessage: (...args: unknown[]) => Promise<unknown>;
  getMultipleMessage: (...args: unknown[]) => Promise<unknown>;
  getSendingMessageList: (...args: unknown[]) => Promise<unknown>;
  getNormalMsgSeq: (...args: unknown[]) => Promise<unknown>;
  updateMessageTimeAndStatus: (...args: unknown[]) => Promise<unknown>;
  updateMessage: (...args: unknown[]) => Promise<unknown>;
  updateMessageBySeq: (...args: unknown[]) => Promise<unknown>;
  updateColumnsMessage: (...args: unknown[]) => Promise<unknown>;
  insertMessage: (...args: unknown[]) => Promise<unknown>;
  batchInsertMessageList: (...args: unknown[]) => Promise<unknown>;
  getMessageList: (...args: unknown[]) => Promise<unknown>;
  getMessageListNoTime: (...args: unknown[]) => Promise<unknown>;
  messageIfExists: (...args: unknown[]) => Promise<unknown>;
  messageIfExistsBySeq: (...args: unknown[]) => Promise<unknown>;
  getAbnormalMsgSeq: (...args: unknown[]) => Promise<unknown>;
  getAbnormalMsgSeqList: (...args: unknown[]) => Promise<unknown>;
  batchInsertExceptionMsg: (...args: unknown[]) => Promise<unknown>;
  searchMessageByKeyword: (...args: unknown[]) => Promise<unknown>;
  searchMessageByContentType: (...args: unknown[]) => Promise<unknown>;
  searchMessageByContentTypeAndKeyword: (...args: unknown[]) => Promise<unknown>;
  updateMsgSenderNickname: (...args: unknown[]) => Promise<unknown>;
  updateMsgSenderFaceURL: (...args: unknown[]) => Promise<unknown>;
  updateMsgSenderFaceURLAndSenderNickname: (
    ...args: unknown[]
  ) => Promise<unknown>;
  getMsgSeqByClientMsgID: (...args: unknown[]) => Promise<unknown>;
  getMsgSeqListByGroupID: (...args: unknown[]) => Promise<unknown>;
  getMsgSeqListByPeerUserID: (...args: unknown[]) => Promise<unknown>;
  getMsgSeqListBySelfUserID: (...args: unknown[]) => Promise<unknown>;
  deleteAllMessage: (...args: unknown[]) => Promise<unknown>;
  getAllUnDeleteMessageSeqList: (...args: unknown[]) => Promise<unknown>;
  updateSingleMessageHasRead: (...args: unknown[]) => Promise<unknown>;
  updateGroupMessageHasRead: (...args: unknown[]) => Promise<unknown>;
  updateMessageStatusBySourceID: (...args: unknown[]) => Promise<unknown>;
  getAlreadyExistSeqList: (...args: unknown[]) => Promise<unknown>;
  getMessageBySeq: (...args: unknown[]) => Promise<unknown>;
  getMessagesByClientMsgIDs: (...args: unknown[]) => Promise<unknown>;
  getMessagesBySeqs: (...args: unknown[]) => Promise<unknown>;
  getConversationNormalMsgSeq: (...args: unknown[]) => Promise<unknown>;
  checkConversationNormalMsgSeq: (...args: unknown[]) => Promise<unknown>;
  getConversationPeerNormalMsgSeq: (...args: unknown[]) => Promise<unknown>;
  deleteConversationAllMessages: (...args: unknown[]) => Promise<unknown>;
  markDeleteConversationAllMessages: (...args: unknown[]) => Promise<unknown>;
  getUnreadMessage: (...args: unknown[]) => Promise<unknown>;
  markConversationMessageAsReadBySeqs: (...args: unknown[]) => Promise<unknown>;
  markConversationMessageAsReadDB: (...args: unknown[]) => Promise<unknown>;
  deleteConversationMsgs: (...args: unknown[]) => Promise<unknown>;
  markConversationAllMessageAsRead: (...args: unknown[]) => Promise<unknown>;
  searchAllMessageByContentType: (...args: unknown[]) => Promise<unknown>;
  insertSendingMessage: (...args: unknown[]) => Promise<unknown>;
  deleteSendingMessage: (...args: unknown[]) => Promise<unknown>;
  getAllSendingMessages: (...args: unknown[]) => Promise<unknown>;

  // conversation db ops
  getAllConversationListDB: (...args: unknown[]) => Promise<unknown>;
  getAllConversationListToSync: (...args: unknown[]) => Promise<unknown>;
  getHiddenConversationList: (...args: unknown[]) => Promise<unknown>;
  getConversation: (...args: unknown[]) => Promise<unknown>;
  getMultipleConversationDB: (...args: unknown[]) => Promise<unknown>;
  updateColumnsConversation: (...args: unknown[]) => Promise<unknown>;
  updateConversation: (...args: unknown[]) => Promise<unknown>;
  updateConversationForSync: (...args: unknown[]) => Promise<unknown>;
  decrConversationUnreadCount: (...args: unknown[]) => Promise<unknown>;
  batchInsertConversationList: (...args: unknown[]) => Promise<unknown>;
  insertConversation: (...args: unknown[]) => Promise<unknown>;
  getTotalUnreadMsgCountDB: (...args: unknown[]) => Promise<unknown>;
  getConversationByUserID: (...args: unknown[]) => Promise<unknown>;

  // upload db ops
  getUpload: (...args: unknown[]) => Promise<unknown>;
  insertUpload: (...args: unknown[]) => Promise<unknown>;
  updateUpload: (...args: unknown[]) => Promise<unknown>;
  deleteUpload: (...args: unknown[]) => Promise<unknown>;
}
