import mongoose from 'mongoose';

const CreationSchema = new mongoose.Schema({
    owner: {
        type: String,
        required: [false, 'Please provide an owner']
    },
    author: {
        type: String,
        required: [false, 'Please provide an author']
    },
    title: {
        type: String,
        required: [true, 'Please provide a title']
    },
    description: {
        type: String,
        required: [true, 'Please provide a description']
    },
    code: {
        type: String,
        required: [true, 'Please provide code']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    tags: {
        type: Array,
        default: []
    },
    language: {
        type: String,
        required: false,
        default: 'plaintext'
    },
    privacy: {
        type: String,
        enum: ['public', 'private', 'unlisted'],
        default: 'public'
    },
    metadata: {
        lines: Number,
        characters: Number,
        lastModified: Date
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    archived: {
        type: Boolean,
        default: false
    },
    favorites: {
        type: Number,
        default: 0
    },
    favoritedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    views: {
        type: Number,
        default: 0
    },
}, {
    timestamps: true
});

CreationSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

export default mongoose.models.Creation || mongoose.model('Creation', CreationSchema);