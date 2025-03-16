import { useState } from "react";
import { Camera, Mail, User, Trash2, Lock, EyeOff, Eye, X } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { deleteProfile, updateProfile } from "../redux/user/userSlice";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const [selectedImg, setSelectedImg] = useState(null);
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = () => {
    if (newPassword && newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters long.");
    }

    const updatedData = {
      fullName: fullName || currentUser?.fullName,
      profilePic: selectedImg || currentUser?.profilePic,
      newPassword: newPassword || undefined,
    };
    dispatch(updateProfile(updatedData));

    setFullName("");
    setNewPassword("");
  };

  const handleDeleteProfile = () => {
    if (!currentUser) {
      toast.error("User not found!");
      return;
    }
    setShowDeleteModal(false);
    dispatch(deleteProfile(currentUser._id, navigate));
  };

  return (
    <div className="h-full pt-16">
      <div className="max-w-2xl mx-auto p-4 py-2">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || currentUser?.profilePic || "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4"
              />
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-base-content hover:scale-105 p-2 rounded-full cursor-pointer transition-all duration-200"
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              Click the camera icon to update your image
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <input
                type="text"
                className="px-4 py-2.5 bg-base-200 rounded-lg border w-full"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={currentUser?.fullName}
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                {currentUser?.email}
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                New Password
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="px-4 py-2.5 bg-base-200 rounded-lg border w-full pr-10"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-zinc-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-zinc-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleUpdateProfile}
            className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-all"
          >
            Update Profile
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            <Trash2 className="w-5 h-5" /> Delete Profile
          </button>

          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>
                  {currentUser?.createdAt
                    ? new Date(currentUser.createdAt).toLocaleDateString("en-GB")
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center">
              <h2 className="text-lg text-red-500 font-bold">Confirm Deletion</h2>
              <button onClick={() => setShowDeleteModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Are you sure you want to delete your profile? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-3xl"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-3xl"
                onClick={handleDeleteProfile}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
