import mongoose from 'mongoose';

const CreationSchema = new mongoose.Schema({
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
    author: {
        type: String,
        required: [false]
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    visibility: {
        type: String,
        default: 'public'
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
    status: {
        type: String,
        enum: ['public', 'private', 'unlisted'],
        default: 'active'
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
}, {
    timestamps: true
});

CreationSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

export default mongoose.models.Creation || mongoose.model('Creation', CreationSchema);