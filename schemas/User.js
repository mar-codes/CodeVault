import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please provide a username'],
        unique: true
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please provide a password']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    creations: {
        type: Array,
        default: []
    },
    bio: {
        type: String,
        maxLength: [500, 'Bio cannot be longer than 500 characters']
    },
    avatar: {
        type: String
    },
    website: {
        type: String
    },
    github: {
        type: String
    },
    twitter: {
        type: String
    },
    location: {
        type: String
    },
    displayName: {
        type: String
    },
    skills: {
        type: [String],
        default: []
    },
    bannerColor: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
        validate: {
            validator: Number.isInteger,
            message: 'Banner color must be an integer'
        }
    },
    isCustomGradient: {
        type: Boolean,
        default: false
    },
    customGradient: {
        from: String,
        to: String
    },
    settings: {
        theme: {
            type: String,
            enum: ['system', 'light', 'dark'],
            default: 'system'
        },
        emailNotifications: {
            projectUpdates: { type: Boolean, default: true },
            security: { type: Boolean, default: true },
            newsletter: { type: Boolean, default: false }
        },
        accessibility: {
            reduceAnimations: { type: Boolean, default: false },
            highContrast: { type: Boolean, default: false }
        },
        privacy: {
            profileVisibility: { type: String, enum: ['public', 'private'], default: 'public' },
            showEmail: { type: Boolean, default: false }
        },
        language: {
            type: String,
            default: 'en'
        }
    }
})

export default mongoose.models.User || mongoose.model('User', UserSchema);