import { host } from "./ServerHost";

const request = async (type, route, body) => {
  try {
    let response = await fetch(`${host}${route}`, {
      method: type,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body), // body data type must match "Content-Type" header
    }).then((data) => data.json());
    return await response;
  } catch (err) {
    throw err;
  }
};

//Fetches a user profile with the email email.
//Returns a profile object if the user exists, otherwise
//An empty array
const getUserProfileByEmail = async (email) => {
  return await request("GET", "/users/email/" + email);
};

//Fetches a user profile with the email email.
//Returns a profile object if the user exists, otherwise
//An empty array
const getUserProfileById = async (id) => {
  return await request("GET", "/users/" + id);
};

const getMyOffers = async (id) => {
  return await request("GET", "/offers/user/" + id);
};

const getOffers = async (id, communities) => {
  let query = "?communities=" + communities.join(",");
  let offers = await request("GET", "/offers/other/" + id + query);
  return [...new Set(offers)];
};

const getCommunities = async () => {
  let communities = await request("Get", "/communities");
  return [...new Set(communities)];
};

const getUserCommunities = async (user_id) => {
  return await request("Get", "/users/community/" + user_id);
};

const getMyRequests = async (id) => {
  return await request("GET", "/requests/user/" + id);
};

const getRequests = async (id, communities) => {
  let query = "?communities=" + communities.join(",");
  return await request("GET", "/requests/other/" + id + query);
};

//Sends an profile to the database, returns an array with the profile
//object with their id added.
const addProfile = async (profile, communities) => {
  await request("POST", "/users", profile);
  const updatedProfile = await getUserProfileByEmail(profile.email);
  await addToCommunity(updatedProfile[0].id, communities);
  return updatedProfile;
};

const addTransaction = async (transaction) => {
  return await request("POST", "/transactions", transaction);
};

const addToCommunity = async (profile_id, communities) => {
  // Should be refactored to only send one request with all communities
  for (const id of communities) {
    const upload_obj = {
      user_id: profile_id,
      community_id: id,
    };

    const result = await request("POST", "/users/community/", upload_obj);
  }
};

const deleteProfile = async (id) => {
  return await request("DELETE", "/users/" + id).catch((err) =>
    console.log(err)
  );
};

const removeUserFromCommunity = async (userId, communityId) => {
  const obj = {
    user_id: userId,
    community_id: communityId,
  };

  return await request("DELETE", "/users/community", obj).catch((err) =>
    console.log(err)
  );
};

export {
  getMyOffers,
  getOffers,
  getMyRequests,
  getRequests,
  getUserProfileById,
  getUserProfileByEmail,
  addProfile,
  getCommunities,
  getUserCommunities,
  addToCommunity,
  addTransaction,
  deleteProfile,
  removeUserFromCommunity,
};
