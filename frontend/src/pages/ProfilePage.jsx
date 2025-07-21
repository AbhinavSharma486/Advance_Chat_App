import { useState } from "react";
import { Camera, Mail, User, Trash2, Lock, EyeOff, Eye, X, Loader2 } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { deleteProfile, updateProfile } from "../redux/user/userSlice";

import { useRef } from "react";

const ProfilePage = () => {
  const [selectedImg, setSelectedImg] = useState(null);
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const { currentUser, isUpdatingProfile } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isDeletingProfile, setIsDeletingProfile] = useState(false);
  const deleteProfileRef = useRef();

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAvatarLoading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImg(reader.result);
        setTimeout(() => setAvatarLoading(false), 800); // Simulate loading for better UX
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

  const handleDeleteProfile = async () => {
    if (!currentUser) {
      toast.error("User not found!");
      return;
    }
    setShowDeleteModal(false);
    setIsDeletingProfile(true);
    try {
      await dispatch(deleteProfile(currentUser._id, navigate));
    } finally {
      setIsDeletingProfile(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 bg-base-100">
      {(isUpdatingProfile || isDeletingProfile) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <span className="text-base-content font-medium text-lg">
              {isUpdatingProfile ? "Updating profile..." : "Deleting profile..."}
            </span>
          </div>
        </div>
      )}
      <div className="max-w-2xl mx-auto px-2 sm:px-4 py-2 w-full">
        <div className="bg-base-300 rounded-xl p-4 sm:p-6 space-y-8">

          {/* Back to Chat Button */}
          <button
            onClick={() => navigate("/")}
            className="mb-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-content hover:bg-primary/90 transition-all w-full sm:w-auto justify-center text-base font-medium"
          >
            <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' /></svg>
            Back to Chat
          </button>

          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-semibold text-base-content">Profile</h1>
            <p className="mt-2 text-base-content/70 text-sm sm:text-base">Your profile information</p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || currentUser?.profilePic || "/avatar.png"}
                alt="Profile"
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-base-200"
                style={{ opacity: avatarLoading ? 0.5 : 1 }}
              />
              {avatarLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-full">
                  <Loader2 className="w-10 h-10 text-white animate-spin" />
                </div>
              )}
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
                  disabled={avatarLoading}
                />
              </label>
            </div>
            <p className="text-xs sm:text-sm text-base-content/60">
              Click the camera icon to update your image
            </p>
          </div>

          <div className="space-y-6">

            <div className="space-y-2">
              <div className="text-sm text-base-content/70 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <input
                type="text"
                className="px-3 py-2 sm:px-4 sm:py-2.5 bg-base-200 rounded-lg border w-full text-base-content placeholder-base-content/40 text-sm sm:text-base"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={currentUser?.fullName}
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm text-base-content/70 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <div className="px-3 py-2 sm:px-4 sm:py-2.5 bg-base-200 rounded-lg border w-full overflow-x-auto text-base-content text-sm sm:text-base break-all">
                <span className="block whitespace-pre-line break-all">{currentUser?.email}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-base-content/70 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                New Password
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="px-3 py-2 sm:px-4 sm:py-2.5 bg-base-200 rounded-lg border w-full pr-10 text-base-content placeholder-base-content/40 text-sm sm:text-base"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="off"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-base-content/60" />
                  ) : (
                    <Eye className="w-5 h-5 text-base-content/60" />
                  )}
                </button>
              </div>
            </div>

          </div>

          <button
            onClick={handleUpdateProfile}
            className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-base font-medium"
            disabled={isUpdatingProfile}
          >
            {isUpdatingProfile ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Profile"
            )}
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-all text-base font-medium"
          >
            <Trash2 className="w-5 h-5" /> Delete Profile
          </button>

          <div className="mt-6 bg-base-200 rounded-xl p-4 sm:p-6">
            <h2 className="text-lg font-medium mb-4 text-base-content">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex flex-row items-center justify-between gap-2 py-2 border-b border-base-300 flex-nowrap">
                <span className="text-base-content/70 whitespace-nowrap">Member Since</span>
                <span className="text-base-content whitespace-nowrap overflow-x-auto max-w-[60%] text-right">
                  {currentUser?.createdAt
                    ? new Date(currentUser.createdAt).toLocaleDateString("en-GB")
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {
        showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-2">
            <div className="bg-base-100 p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-xs sm:max-w-md">
              <div className="flex justify-between items-center">
                <h2 className="text-lg text-red-500 font-bold">Confirm Deletion</h2>
                <button onClick={() => setShowDeleteModal(false)}>
                  <X className="w-5 h-5 text-base-content" />
                </button>
              </div>
              <p className="mt-4 text-sm text-base-content/70">
                Are you sure you want to delete your profile? This action cannot be undone.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  className="bg-base-200 hover:bg-base-300 text-base-content px-4 py-2 rounded-3xl"
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
        )
      }
    </div>
  );
};

export default ProfilePage;