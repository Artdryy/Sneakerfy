const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');

// --- SEND MESSAGE ---
exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, content, sneakerId } = req.body;
    
    const newMessage = new Message({
      sender: req.user.id,
      recipient: recipientId,
      content,
      sneaker: sneakerId || null
    });

    await newMessage.save();
    res.status(201).json(newMessage);

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// --- GET CONVERSATION ---
exports.getConversation = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const currentUserId = req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: otherUserId },
        { sender: otherUserId, recipient: currentUserId }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// --- GET INBOX (List of conversations) ---
exports.getInbox = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        
        // Find distinct users I have sent messages to OR received messages from
        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { sender: new mongoose.Types.ObjectId(currentUserId) }, 
                        { recipient: new mongoose.Types.ObjectId(currentUserId) }
                    ]
                }
            },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$sender", new mongoose.Types.ObjectId(currentUserId)] },
                            "$recipient",
                            "$sender"
                        ]
                    },
                    lastMessage: { $first: "$$ROOT" }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'contactInfo'
                }
            },
            {
                $project: {
                    contactInfo: { $arrayElemAt: ["$contactInfo", 0] },
                    lastMessage: 1
                }
            }
        ]);

        res.json(conversations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};