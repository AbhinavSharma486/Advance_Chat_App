import { useState } from 'react';
import { Camera, Mail, User, Trash2 } from "lucide-react";
import { useSelector, useDispatch } from 'react-redux';
import { deleteProfile, updateProfile } from '../redux/user/userSlice';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const [selectedImg, setSelectedImg] = useState(null);
  const [fullName, setFullName] = useState("");
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
    const updatedData = {
      fullName: fullName || currentUser?.fullName,
      profilePic: selectedImg || currentUser?.profilePic,
    };
    dispatch(updateProfile(updatedData));
  };

  const handleDeleteProfile = () => {
    if (window.confirm("Are you sure you want to delete your profile? This action cannot be undone.")) {
      dispatch(deleteProfile(currentUser._id, navigate));
      toast.success("Profile deleted successfully.");
    }
  };

  return (
    <div className='h-full pt-16'>
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
                className='size-32 rounded-full object-cover border-4'
              />
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-base-content hover:scale-105 p-2 rounded-full cursor-pointer transition-all duration-200"
              >
                <Camera className='w-5 h-5 text-base-200' />
                <input
                  type="file"
                  id='avatar-upload'
                  className='hidden'
                  accept='image/*'
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
                <User className='w-4 h-4' />
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
                <Mail className='w-4 h-4' />
                Email Address
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                {currentUser?.email}
              </p>
            </div>
          </div>

          <button
            onClick={handleUpdateProfile}
            className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-all"
          >
            Update Profile
          </button>

          <button
            onClick={handleDeleteProfile}
            className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            <Trash2 className='w-5 h-5' /> Delete Profile
          </button>

          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">
              Account Information
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>
                  {currentUser.createdAt?.split("T")[0]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
