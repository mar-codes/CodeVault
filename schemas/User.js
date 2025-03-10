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
        max: 5,
        validate: {
            validator: Number.isInteger,
            message: 'Banner color must be an integer'
        }
    }
})

export default mongoose.models.User || mongoose.model('User', UserSchema);