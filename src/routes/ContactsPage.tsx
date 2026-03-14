const ContactsPage = () => {
  return (
    <div className="mx-auto max-w-270">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          My Contacts
        </h2>
      </div>
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            Team Contacts
          </h3>
        </div>
        <div className="p-7">
          <p className="text-body-color dark:text-bodydark">
            This page will display your internal company contacts and team members.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactsPage;
