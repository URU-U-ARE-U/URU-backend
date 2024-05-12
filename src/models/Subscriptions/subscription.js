import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  tier: {
    type: String,
    enum: ["Free", "Basic", "Premium"],
    required: true,
    default: "Free",
  },
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
