import React, { useState, useEffect, useRef } from 'react';
import { useSession } from '../ui/useSession';
import { updateProfile } from 'firebase/auth';
import { auth } from '../lib/firebase';

const avatars = [
  { id: '1', bgColor: 'bg-primary', icon: '👤', color: 'text-white' },
  { id: '2', bgColor: 'bg-success', icon: '💼', color: 'text-white' },
  { id: '3', bgColor: 'bg-warning', icon: '⭐', color: 'text-white' },
  { id: '4', bgColor: 'bg-meta-5', icon: '⚡', color: 'text-white' },
  { id: '5', bgColor: 'bg-meta-3', icon: '🔥', color: 'text-white' },
];

const ProfilePage = () => {
  const { session } = useSession();
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const isInitialMount = useRef(true);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Update local state when session object changes
  useEffect(() => {
    if (session) {
      setDisplayName(session.displayName || '');
      setPhotoURL(session.photoURL || '');
    }
  }, [session]);

  const saveProfile = async (currentName: string, currentPhoto: string) => {
    if (!auth.currentUser) return;
    
    // Don't save if there's no change from what's already in the session
    if (currentName === session?.displayName && currentPhoto === session?.photoURL) return;

    setIsUpdating(true);
    setMessage('Saving changes...');

    try {
      await updateProfile(auth.currentUser, {
        displayName: currentName,
        photoURL: currentPhoto,
      });
      setMessage('Settings saved automatically');
      // Clear message after a few seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Error saving changes');
    } finally {
      setIsUpdating(false);
    }
  };

  // Watch for photo updates to save immediately
  useEffect(() => {
    if (isInitialMount.current) {
        if (photoURL) isInitialMount.current = false;
        return;
    }
    if (photoURL) {
        saveProfile(displayName, photoURL);
    }
  }, [photoURL]);

  // Debounced save for display name
  const handleNameChange = (newName: string) => {
    setDisplayName(newName);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      saveProfile(newName, photoURL);
    }, 1000);
  };

  const handleCustomPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoURL(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const isAvatar = (url: string) => url.startsWith('avatar:');
  const getAvatarId = (url: string) => url.split(':')[1];

  const renderPhoto = (url: string) => {
    if (isAvatar(url)) {
      const avatar = avatars.find(a => a.id === getAvatarId(url)) || avatars[0];
      return (
        <div className={`h-full w-full flex items-center justify-center ${avatar.bgColor} ${avatar.color} text-6xl font-bold`}>
          {avatar.icon}
        </div>
      );
    }
    return <img src={url} alt="User" className="h-full w-full object-cover" />;
  };

  return (
    <div className="mx-auto max-w-270">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          My Profile
        </h2>
        {message && (
          <div className="flex items-center gap-2">
            <span className={`text-sm ${message.includes('Error') ? 'text-danger' : 'text-success'}`}>
              {message}
            </span>
            {isUpdating && <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>}
          </div>
        )}
      </div>

      <div className="grid grid-cols-5 gap-8">
        <div className="col-span-12 xl:col-span-3">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Personal Information
              </h3>
            </div>
            <div className="p-7">
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                  <div className="w-full sm:w-1/2">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="fullName"
                    >
                      Full Name
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      type="text"
                      name="fullName"
                      id="fullName"
                      placeholder="Enter your name"
                      value={displayName}
                      onChange={(e) => handleNameChange(e.target.value)}
                    />
                    <p className="mt-2 text-xs text-slate-500">Name updates automatically as you type.</p>
                  </div>

                  <div className="w-full sm:w-1/2">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="emailAddress"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary opacity-70"
                        type="email"
                        name="emailAddress"
                        id="emailAddress"
                        placeholder="email@example.com"
                        value={session?.email || ''}
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4.5">
                  <button
                    className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                    type="button"
                    onClick={() => {
                        setDisplayName(session?.displayName || '');
                        setPhotoURL(session?.photoURL || '');
                    }}
                  >
                    Reset Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="col-span-12 xl:col-span-2">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Your Avatar
              </h3>
            </div>
            <div className="p-7">
              <div className="flex flex-col items-center">
                <div className="mb-4 h-32 w-32 rounded-full overflow-hidden border-4 border-stroke dark:border-strokedark shadow-lg">
                  {photoURL ? renderPhoto(photoURL) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray dark:bg-meta-4 text-slate-400">
                      No Photo
                    </div>
                  )}
                </div>
                
                <div className="mb-6 w-full text-center">
                   <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Click an icon to update instantly
                  </label>
                  <div className="flex justify-center flex-wrap gap-4">
                    {avatars.map((avatar) => (
                      <button
                        key={avatar.id}
                        type="button"
                        onClick={() => setPhotoURL(`avatar:${avatar.id}`)}
                        className={`h-12 w-12 rounded-full flex items-center justify-center transition-all ${avatar.bgColor} ${avatar.color} border-4 ${
                          photoURL === `avatar:${avatar.id}` ? 'border-primary rotate-12 scale-110 shadow-lg' : 'border-transparent opacity-80 hover:opacity-100 hover:scale-105'
                        }`}
                      >
                        <span className="text-xl">{avatar.icon}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="w-full border-t border-stroke py-4 dark:border-strokedark">
                    <label className="mb-3 block text-center text-sm font-medium text-black dark:text-white">
                        Or Upload Custom
                    </label>
                    <div
                    id="FileUpload"
                    className="relative block w-full cursor-pointer appearance-none rounded border-2 border-dashed border-primary bg-gray py-4 px-4 dark:bg-meta-4"
                    >
                    <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0"
                        onChange={handleCustomPhoto}
                    />
                    <div className="flex flex-col items-center justify-center space-y-1 text-center font-medium">
                        <p className="text-xs">
                        <span className="text-primary">Click to upload</span>
                        </p>
                        <p className="text-[10px]">JPG, PNG or GIF</p>
                    </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
