import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema({

    subscriber: {
        type: Schema.Types.ObjectId, // who are is subscribing
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId, // one to 'subscriber' is subscribing
        ref: "User"
    }

}, { timestamps: true })

export const Subscription = mongoose.model("Subscription", subscriptionSchema)