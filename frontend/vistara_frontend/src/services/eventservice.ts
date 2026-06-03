import Api from "./axiosinstances";

export const getEvents=async()=>{
    const res=await Api.get("/events/");
    return res.data;
};

export const getEventDetails=async(eventId:string)=>{
    const res=await Api.get(`/events/${eventId}/`);
    return res.data;
};

export const getEventPhotos=async(eventId:string)=>{
    const res=await Api.get(`/events/${eventId}/photos/`);
    return res.data.photos;
};