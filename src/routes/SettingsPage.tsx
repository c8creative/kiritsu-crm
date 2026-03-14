const SettingsPage = () => {
  return (
    <div className="mx-auto max-w-270">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Account Settings
        </h2>
      </div>
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            Account Preferences
          </h3>
        </div>
        <div className="p-7">
          <p className="text-body-color dark:text-bodydark mb-4">
            Manage your account settings and notification preferences here.
          </p>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-black dark:text-white">Email Notifications</h4>
                <p className="text-sm">Receive alerts about new opportunities</p>
              </div>
              <input type="checkbox" className="h-5 w-5" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-black dark:text-white">Dark Mode</h4>
                <p className="text-sm">Use the system-wide dark theme</p>
              </div>
              <input type="checkbox" className="h-5 w-5" defaultChecked />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
