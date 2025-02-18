import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlenth: 6
    },
    profilePic: {
      type: String,
      default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
    },
    isVerified: {
      type: Boolean,
      default: false
    },

    resetPasswordToken: String,

    resetPasswordTokenExpiresAt: Date,

    verificationToken: String,

    verificationTokenExpiresAt: Date,

  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;