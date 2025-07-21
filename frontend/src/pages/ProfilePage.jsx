import { useState, useRef } from "react";
import { Camera, Mail, User, Trash2, Lock, EyeOff, Eye, X, Loader2 } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Cropper from 'react-easy-crop';

import { deleteProfile, updateProfile } from "../redux/user/userSlice";
import getCroppedImg, { getAvatarUrl } from '../lib/util';

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
  const [showCropModal, setShowCropModal] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImg, setCroppedImg] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [previewPan, setPreviewPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [imgStart, setImgStart] = useState({ x: 0, y: 0 });

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAvatarLoading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImg(reader.result);
        setShowCropModal(true);
        setTimeout(() => setAvatarLoading(false), 800);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropSave = async () => {
    try {
      setAvatarLoading(true);
      // getCroppedImg now returns a blob URL or data URL
      const croppedImageUrl = await getCroppedImg(selectedImg, croppedAreaPixels);
      setCroppedImg(croppedImageUrl);
      setSelectedImg(croppedImageUrl);
      setShowCropModal(false);
    } catch (e) {
      toast.error('Failed to crop image');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (newPassword && newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters long.");
    }

    let profilePicToSend = selectedImg || currentUser?.profilePic;
    // If it's a blob URL, convert to base64
    if (profilePicToSend && profilePicToSend.startsWith('blob:')) {
      profilePicToSend = await fetch(profilePicToSend)
        .then(res => res.blob())
        .then(blob => new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        }));
    }

    const updatedData = {
      fullName: fullName || currentUser?.fullName,
      profilePic: profilePicToSend,
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

  const handlePreviewWheel = (e) => {
    e.preventDefault();
    setPreviewZoom((z) => {
      let next = z + (e.deltaY < 0 ? 0.1 : -0.1);
      if (next < 1) next = 1;
      if (next > 5) next = 5;
      return Number(next.toFixed(2));
    });
  };

  let lastTouchDist = null;
  const handlePreviewMouseDown = (e) => {
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
    setImgStart({ ...previewPan });
  };
  const handlePreviewMouseMove = (e) => {
    if (!isPanning) return;
    const dx = e.clientX - panStart.x;
    const dy = e.clientY - panStart.y;
    setPreviewPan({ x: imgStart.x + dx, y: imgStart.y + dy });
  };
  const handlePreviewMouseUp = () => {
    setIsPanning(false);
  };
  // Touch pan for mobile
  const [touchPanStart, setTouchPanStart] = useState(null);
  const handlePreviewTouchStart = (e) => {
    if (e.touches.length === 2) {
      // Pinch zoom logic (already present)
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDist = Math.sqrt(dx * dx + dy * dy);
    } else if (e.touches.length === 1) {
      setTouchPanStart({ x: e.touches[0].clientX, y: e.touches[0].clientY, ...previewPan });
    }
  };
  const handlePreviewTouchMove = (e) => {
    if (e.touches.length === 2 && lastTouchDist !== null) {
      // Pinch zoom logic (already present)
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDist = Math.sqrt(dx * dx + dy * dy);
      setPreviewZoom((z) => {
        let next = z + (newDist - lastTouchDist) / 200;
        if (next < 1) next = 1;
        if (next > 5) next = 5;
        return Number(next.toFixed(2));
      });
      lastTouchDist = newDist;
    } else if (e.touches.length === 1 && touchPanStart) {
      const dx = e.touches[0].clientX - touchPanStart.x;
      const dy = e.touches[0].clientY - touchPanStart.y;
      setPreviewPan({ x: touchPanStart.x + dx, y: touchPanStart.y + dy });
    }
  };
  const handlePreviewTouchEnd = (e) => {
    if (e.touches.length < 2) lastTouchDist = null;
    if (e.touches.length === 0) setTouchPanStart(null);
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

          <div className="relative flex flex-col items-center">
            <img
              src={croppedImg || selectedImg || getAvatarUrl(currentUser?.profilePic)}
              alt="Profile"
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-base-200"
              style={{ opacity: avatarLoading ? 0.5 : 1 }}
            />
            {avatarLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-full">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              </div>
            )}
            {/* Icons row below avatar */}
            <div className="flex flex-row items-center gap-4 mt-3">
              {/* Upload Icon */}
              <div className="relative group">
                <label
                  htmlFor="avatar-upload"
                  className="bg-base-content hover:scale-105 p-2 rounded-full cursor-pointer transition-all duration-200 mb-0 flex items-center"
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
                <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-20">Upload</span>
              </div>
              {/* Preview Icon */}
              <div className="relative group">
                <button
                  type="button"
                  className="bg-base-content hover:bg-blue-500 p-2 rounded-full cursor-pointer transition-all duration-200 flex items-center"
                  onClick={() => setShowPreviewModal(true)}
                  disabled={avatarLoading}
                  aria-label="Preview Avatar"
                >
                  <Eye className="w-5 h-5 text-base-200" />
                </button>
                <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-20">Preview</span>
              </div>
              {/* Delete Icon */}
              {(selectedImg || croppedImg || currentUser?.profilePic) && (
                <div className="relative group">
                  <button
                    type="button"
                    className="bg-base-content hover:bg-red-500 p-2 rounded-full cursor-pointer transition-all duration-200 flex items-center"
                    onClick={async () => {
                      setSelectedImg(null);
                      setCroppedImg(null);
                      await dispatch(updateProfile({ profilePic: null, fullName: currentUser?.fullName }));
                      toast.success("Avatar removed. Default avatar set.");
                    }}
                    disabled={avatarLoading}
                    aria-label="Remove Avatar"
                  >
                    <Trash2 className="w-5 h-5 text-base-200" />
                  </button>
                  <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-20">Remove</span>
                </div>
              )}
            </div>
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
      {showCropModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-base-100 p-4 rounded-lg shadow-lg flex flex-col items-center">
            <div className="relative w-72 h-72 bg-black">
              <Cropper
                image={selectedImg}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="flex gap-4 mt-4">
              <button onClick={() => setShowCropModal(false)} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
              <button onClick={handleCropSave} className="bg-blue-500 text-white px-4 py-2 rounded">Crop & Save</button>
            </div>
          </div>
        </div>
      )}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-base-100 p-4 rounded-lg shadow-lg flex flex-col items-center relative min-w-[320px]">
            <button className="absolute top-2 right-2 p-1 rounded-full hover:bg-base-200" onClick={() => { setShowPreviewModal(false); setPreviewZoom(1); setPreviewPan({ x: 0, y: 0 }); }}>
              <X className="w-6 h-6 text-base-content" />
            </button>
            <div
              className="flex flex-col items-center select-none"
              onWheel={handlePreviewWheel}
              onMouseDown={handlePreviewMouseDown}
              onMouseMove={handlePreviewMouseMove}
              onMouseUp={handlePreviewMouseUp}
              onMouseLeave={handlePreviewMouseUp}
              onTouchStart={handlePreviewTouchStart}
              onTouchMove={handlePreviewTouchMove}
              onTouchEnd={handlePreviewTouchEnd}
              style={{ touchAction: 'pinch-zoom' }}
            >
              <div className="overflow-hidden flex items-center justify-center w-64 h-64 rounded-full border-4 border-base-200 bg-base-200 cursor-grab">
                <img
                  src={croppedImg || selectedImg || getAvatarUrl(currentUser?.profilePic)}
                  alt="Avatar Preview"
                  className="object-contain w-full h-full"
                  style={{ transform: `scale(${previewZoom}) translate(${previewPan.x / previewZoom}px, ${previewPan.y / previewZoom}px)` }}
                  draggable={false}
                />
              </div>
              <span className="text-xs text-base-content/60 mt-1">Zoom: {previewZoom.toFixed(2)}x (max 5x)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;