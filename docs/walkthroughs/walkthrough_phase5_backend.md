# Phase 5 — Backend Code Walkthrough (Line-by-Line)

---

## File 1: [NEW] Message.js

📁 `server/models/Message.js` — Mongoose schema for the messaging system.

```js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
```
- **Lines 1-19**: Defines the schema. A message references three entities: the `sender` (User), the `receiver` (User), and the `listing` (the item they are discussing). Linking the listing is crucial because the same two users might discuss multiple different items, and we want to group those conversations separately.

```js
  content: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: [2000, 'Message cannot be more than 2000 characters']
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});
```
- **Lines 20-31**: `content` holds the actual text, limited to 2000 characters. `isRead` is a boolean flag that defaults to `false` when a message is created. It gets set to `true` when the receiver opens the chat. `timestamps: true` automatically adds `createdAt` and `updatedAt` fields.

```js
// Index for faster conversation queries
messageSchema.index({ sender: 1, receiver: 1, listing: 1 });
messageSchema.index({ createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;
```
- **Lines 34-35**: Creates compound indexes. Since we frequently query messages between two specific users regarding a specific listing, indexing `sender`, `receiver`, and `listing` makes these queries highly performant. The `createdAt: -1` index optimizes sorting messages chronologically.
- **Lines 37-38**: Compiles the schema into a model and exports it.

---

## File 2: [NEW] messageController.js

📁 `server/controllers/messageController.js` — Core business logic for sending and fetching messages.

### 🔹 sendMessage (Lines 5-46)

```js
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, listingId, content } = req.body;

    if (!receiverId || !listingId || !content?.trim()) {
      return res.status(400).json({ message: 'Receiver, listing, and content are required' });
    }
```
- **Lines 8-13**: Extracts the necessary fields from the request body and validates that they all exist.

```js
    // Prevent sending message to yourself
    if (receiverId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot message yourself' });
    }
```
- **Lines 15-18**: Security/logic check: Prevents a user from initiating a conversation with themselves.

```js
    // Verify receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Verify listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
```
- **Lines 20-29**: Validates that both the target user and the target listing actually exist in the database before creating the message.

```js
    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      listing: listingId,
      content: content.trim()
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar')
      .populate('listing', 'title images price');

    res.status(201).json(populatedMessage);
```
- **Lines 31-43**: Creates the message document. Then immediately fetches it back while `.populate()`ing the sender, receiver, and listing details. We return this fully populated message so the frontend can instantly display it in the chat UI with avatars and listing info.

---

### 🔹 getConversations (Lines 48-105)

This function builds the "inbox" sidebar on the Messages page. It groups raw messages into distinct "Conversations".

```js
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all messages where user is sender or receiver
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar')
      .populate('listing', 'title images price isSold');
```
- **Lines 55-61**: Fetches ALL messages involving the current user, sorted newest first. Populates the necessary fields to display the conversation cards.

```js
    // Group by conversation (unique combination of other user + listing)
    const conversationMap = new Map();

    messages.forEach((msg) => {
      const otherUser = msg.sender._id.toString() === userId.toString()
        ? msg.receiver
        : msg.sender;
```
- **Lines 63-69**: We use a `Map` to group messages. For each message, we determine who the "other" user is (if the current user is the sender, the other user is the receiver, and vice versa).

```js
      // Key is combination of other user ID and listing ID
      const key = `${otherUser._id}-${msg.listing._id}`;

      if (!conversationMap.has(key)) {
        conversationMap.set(key, {
          // ... constructs the conversation object (listing details, otherUser, lastMessage)
          unreadCount: 0
        });
      }
```
- **Lines 71-92**: A conversation is uniquely identified by `otherUserId-listingId`. Because the messages were fetched sorted by `createdAt: -1` (newest first), the *first* time we encounter a specific `key` in the loop, that message is guaranteed to be the most recent message (the `lastMessage`) for that conversation. We set it in the map and ignore older messages for the structural skeleton.

```js
      // Count unread messages sent by the OTHER user (not by me)
      if (!msg.isRead && msg.receiver._id.toString() === userId.toString()) {
        const conv = conversationMap.get(key);
        conv.unreadCount += 1;
      }
    });

    const conversations = Array.from(conversationMap.values());
    res.json({ conversations });
```
- **Lines 94-102**: Even though we only store the `lastMessage` for display, we still loop through all older messages to tally up the total number of unread messages sent *to* the current user in this thread. Finally, we convert the Map back to an array and send it.

---

### 🔹 getMessages (Lines 107-142)

This fetches the actual chat thread when a user clicks a conversation.

```js
export const getMessages = async (req, res) => {
  try {
    const { userId, listingId } = req.params;
    const currentUserId = req.user._id;

    const messages = await Message.find({
      listing: listingId,
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar');
```
- **Lines 111-120**: Queries for messages regarding `listingId` that are either from UserA to UserB, or from UserB to UserA. `.sort({ createdAt: 1 })` orders them oldest-to-newest so they read top-to-bottom in the UI.

```js
    // Mark messages as read (messages sent TO the current user)
    await Message.updateMany(
      {
        listing: listingId,
        sender: userId,
        receiver: currentUserId,
        isRead: false
      },
      { isRead: true }
    );
```
- **Lines 122-131**: Automatically marks all unread messages in this thread as read. It specifically targets messages where `receiver: currentUserId` (you only "read" messages sent to you).

```js
    // Get other user and listing info
    const otherUser = await User.findById(userId).select('name avatar department');
    const listing = await Listing.findById(listingId).select('title images price isSold seller');

    res.json({ messages, otherUser, listing });
```
- **Lines 133-138**: Fetches some metadata about the other user and the listing to populate the chat header, and returns the payload.

---

### 🔹 getUnreadCount (Lines 144-156)

```js
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      isRead: false
    });

    res.json({ count });
```
- **Lines 144-156**: A simple, fast query used by the Navbar to show the global unread notification badge. Just counts all unread messages across all conversations where the current user is the receiver.

---

## File 3: [NEW] messageRoutes.js

📁 `server/routes/messageRoutes.js`

```js
import express from 'express';
import {
  sendMessage, getConversations, getMessages, getUnreadCount
} from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/send', sendMessage);
router.get('/conversations', getConversations);
router.get('/unread-count', getUnreadCount);
router.get('/:userId/:listingId', getMessages);

export default router;
```
- Standard Express router setup. `protect` middleware ensures only logged-in users with valid JWTs can hit these endpoints.
- Important routing note: `/conversations` and `/unread-count` must be declared *before* `/:userId/:listingId` to prevent Express from misinterpreting "conversations" as a dynamic `userId` parameter.

---

## File 4: [MODIFIED] server.js

📁 `server/server.js`

```diff
+import messageRoutes from './routes/messageRoutes.js';
...
+app.use('/api/messages', messageRoutes);
```
- Simply registers the new message router under the `/api/messages` prefix in the main Express app.
