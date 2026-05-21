# Phase 5 — Frontend Walkthrough (Line-by-Line)

---

## File 1: [NEW] Messages.jsx

📁 `client/src/pages/Messages.jsx` — Full-page messaging interface (301 lines).

### Setup and State (Lines 1-45)

```js
const Messages = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const messagesEndRef = useRef(null);
```
- **Line 21**: `useSearchParams` hook from React Router to read URL query parameters.
- **Line 22**: `useRef` to maintain a reference to a DOM element at the bottom of the chat list, used for auto-scrolling.

```js
  // Conversations state
  const [conversations, setConversations] = useState([]);
  const [loadingConvos, setLoadingConvos] = useState(true);

  // Active chat state
  const [activeChat, setActiveChat] = useState(null); // { userId, listingId }
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [chatListing, setChatListing] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  // Mobile view state
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
```
- **Lines 24-38**: Segregates state into three logical blocks: sidebar (conversations), main view (active chat), and mobile layout toggles.

### Lifecycle Hooks & Actions (Lines 40-107)

```js
  // Check for URL params (when coming from ListingDetail "Message Seller")
  useEffect(() => {
    const sellerId = searchParams.get('seller');
    const listingId = searchParams.get('listing');
    if (sellerId && listingId) {
      openChat(sellerId, listingId);
    }
  }, [searchParams]);
```
- **Lines 40-47**: If a user clicks "Message Seller" on a listing, they navigate to `/messages?seller=123&listing=456`. This hook intercepts those parameters and immediately opens the chat for that specific thread.

```js
  // Fetch conversations on mount
  useEffect(() => { fetchConversations(); }, []);

  // Scroll to bottom when messages change
  useEffect(() => { scrollToBottom(); }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
```
- **Lines 50-57**: Fetches the inbox list on load. The `scrollToBottom` effect ensures that whenever new messages are loaded (or sent), the chat view scrolls down to show the latest message.

```js
  const openChat = async (userId, listingId) => {
    setActiveChat({ userId, listingId });
    setShowChatOnMobile(true);
    setLoadingMessages(true);
    try {
      const { data } = await api.get(`/messages/${userId}/${listingId}`);
      setMessages(data.messages);
      // ... set other meta state ...
      fetchConversations(); // Refresh unread counts
    } // ... error handling
  };
```
- **Lines 69-87**: Sets the active chat, flips the mobile view toggle to show the chat window, fetches the thread from the backend, and then re-fetches the conversation list because opening a chat marks messages as read (which should clear the unread badge in the sidebar).

```js
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || sending) return;
    setSending(true);
    try {
      const { data } = await api.post('/messages/send', {
        receiverId: activeChat.userId,
        listingId: activeChat.listingId,
        content: newMessage.trim()
      });
      setMessages((prev) => [...prev, data]);
      setNewMessage('');
      fetchConversations();
    } // ... error handling
  };
```
- **Lines 89-109**: Prevents empty sends, pushes the new message to the backend, appends the returned message to the local state (updating the UI instantly), clears the input, and updates the sidebar so the latest message text preview changes.

### UI Rendering: Sidebar (Lines 135-214)

```jsx
    <div className="min-h-screen pt-16 lg:pt-18">
      <div className="h-[calc(100vh-4rem)] lg:h-[calc(100vh-4.5rem)] flex">
```
- **Lines 136-137**: Sets up a fixed-height layout. `100vh` minus the navbar height. The `flex` container holds the sidebar and chat view side-by-side.

```jsx
        <div className={`w-full md:w-96 lg:w-[420px] flex-shrink-0 border-r border-dark-700/50 flex flex-col bg-dark-900
          ${showChatOnMobile ? 'hidden md:flex' : 'flex'}`}
        >
```
- **Lines 140-142**: The sidebar. On mobile (`showChatOnMobile` is true), it hides completely when a chat is open. On desktop (`md:flex`), it remains visible as a fixed-width panel.

```jsx
        <button
          key={conv._id}
          onClick={() => openChat(conv.otherUser._id, conv.listing._id)}
          className={`w-full text-left p-4 flex gap-3 ... hover:bg-dark-800/60 ${
            isActive ? 'bg-primary-500/8 border-l-2 border-l-primary-500' : ''
          }`}
        >
```
- **Lines 176-182**: Each conversation is a clickable button. If it is the `activeChat`, it gets highlighted with a purple tint and a left border indicator.

```jsx
          {conv.unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary-500 text-white text-[10px] font-bold flex items-center justify-center">
              {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
            </div>
          )}
```
- **Lines 189-193**: Unread badge positioned absolutely in the top right of the user avatar. Caps at `9+`.

### UI Rendering: Chat Window (Lines 216-339)

```jsx
        <div className={`flex-1 flex flex-col bg-dark-950/50
          ${showChatOnMobile ? 'flex' : 'hidden md:flex'}`}
        >
```
- **Lines 216-218**: The main chat area. Uses `flex-1` to take up all remaining width. Its visibility on mobile is the inverse of the sidebar.

```jsx
          <button
            onClick={() => setShowChatOnMobile(false)}
            className="md:hidden p-2 rounded-xl text-dark-300 hover:bg-dark-800 transition-colors"
          >
            <FiArrowLeft className="text-lg" />
          </button>
```
- **Lines 237-242**: A "Back" button that only appears on mobile screens (`md:hidden`). It sets `showChatOnMobile` to false, which hides the chat and reveals the conversation list again.

```jsx
          <Link
            to={`/listing/${chatListing._id}`}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-800 border ..."
          >
```
- **Lines 252-256**: In the chat header, clicking the mini-listing card takes you to the full listing detail page.

```jsx
          {messages.map((msg, idx) => {
            const isMe = msg.sender._id === user?._id;
            const showAvatar = idx === 0 || messages[idx - 1]?.sender._id !== msg.sender._id;
```
- **Lines 279-281**: Maps over messages. `isMe` determines if the bubble aligns left or right. `showAvatar` is a UX optimization: it only shows the avatar image on the *first* message in a contiguous block of messages from the same person.

```jsx
            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                isMe
                  ? 'bg-primary-500 text-white rounded-br-md'
                  : 'bg-dark-800 text-dark-100 border border-dark-700 rounded-bl-md'
              }`}
            >
              {msg.content}
            </div>
```
- **Lines 298-305**: The chat bubble. Uses Tailwind classes to style it as a pill. The `rounded-br-md` and `rounded-bl-md` give the bubble a "tail" pointing toward the sender.

```jsx
            <div ref={messagesEndRef} />
```
- **Line 318**: An invisible empty div at the very bottom of the message list that the `scrollToBottom` function targets.

```jsx
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              // ...
            />
```
- **Lines 325-332**: The input box. Captures the `Enter` key (without shift) to submit the form immediately, making chatting feel fast and native. Shift+Enter allows line breaks.

---

## File 2: [MODIFIED] Navbar.jsx

📁 `client/src/components/layout/Navbar.jsx` — Added the global unread badge.

```js
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchUnread = async () => {
      try {
        const { data } = await api.get('/messages/unread-count');
        setUnreadCount(data.count);
      } catch (e) { /* non-critical */ }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [isAuthenticated]);
```
- **Lines 21-34**: A polling mechanism. When authenticated, it fetches the unread count immediately, and then every 30 seconds. The cleanup function (`clearInterval`) runs when the component unmounts to prevent memory leaks.

```jsx
  <Link to="/messages" className="relative p-2.5 ...">
    <HiOutlineChat className="text-xl" />
    {unreadCount > 0 && (
      <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-primary-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
        {unreadCount > 9 ? '9+' : unreadCount}
      </span>
    )}
  </Link>
```
- **Lines 105-115**: Wraps the chat icon. If `unreadCount` > 0, it renders an absolute-positioned red/purple badge over the icon.

---

## File 3: [MODIFIED] ListingDetail.jsx

📁 `client/src/pages/ListingDetail.jsx` — Wired up the Message Seller button.

```jsx
  <Button
    className="flex-1 py-3 text-lg"
    variant="primary"
    onClick={() => {
      if (!isAuthenticated) {
        toast.error('Please login to message sellers');
        navigate('/login');
        return;
      }
      navigate(`/messages?seller=${listing.seller?._id}&listing=${listing._id}`);
    }}
  >
    <FiMessageSquare className="mr-2" /> Message Seller
  </Button>
```
- **Lines 279-291**: Replaced the static button. It now performs an auth check. If logged in, it redirects to the `/messages` route, injecting the `seller` ID and `listing` ID into the URL query parameters so the Messages component knows which chat to open.

---

## File 4: [MODIFIED] App.jsx

📁 `client/src/App.jsx` — Route registration.

```diff
+import Messages from './pages/Messages';
...
+<Route path="/messages" element={<Messages />} />
```
- Imported the new component and registered it as a protected route alongside Profile, My Listings, etc.
