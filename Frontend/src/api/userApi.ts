import api from "./axios";

export const createUser = (
  clerkUserId: string,
  username: string,
  fullName: string,
  imageUrl: string
) => {
  return api.post("/users/create", {
    clerkUserId,
    username,
    fullName,
    profileImage: imageUrl   
  });
};


// Get user profile (self or friend)
export const getUserProfile = (userId: string) =>
  api.get(`/users/${userId}`);

// Get user's friends list
export const getUserFriends = (userId: string) =>
  api.get(`/friends/list/${userId}`);

//get user onboarding
export const markUserOnboarded = (clerkUserId: string) => {
  return api.post("/users/onboarded", { clerkUserId });
};

