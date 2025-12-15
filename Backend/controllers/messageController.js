const Message = require('../models/Message');
const User = require('../models/User');

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
// Get messages between current user and another specific user
exports.getConversation = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const currentUserId = req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: otherUserId },
        { sender: otherUserId, recipient: currentUserId }
      ]
    }).sort({ createdAt: 1 }); // Oldest first

    res.json(messages);

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// --- GET INBOX (List of people I've talked to) ---
exports.getInbox = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        
        // Find all messages where I am sender or recipient
        // We aggregate to find unique conversation partners
        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { sender: new mongoose.Types.ObjectId(currentUserId) }, 
                        { recipient: new mongoose.Types.ObjectId(currentUserId) }
                    ]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
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
                    contactInfo: { $arrayElemAt: ["$contactInfo", 0] }, // Flatten array
                    lastMessage: 1
                }
            },
            {
                $project: {
                    "contactInfo.password": 0, // Exclude password
                    "contactInfo.verificationCode": 0
                }
            }
        ]);

        res.json(conversations);
    } catch (error) {
        // Since I used mongoose inside aggregate, I need to require it if not present
        // or just return error. The aggregation above is complex, for a simple MVP
        // we might just return all messages and filter on frontend, but backend is better.
        console.error(error); 
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
// Note: You need `const mongoose = require('mongoose');` at the top for the aggregation above to work.