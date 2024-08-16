import { metadata } from "../config/mongoCollections.js";
export const updatePullTimestamp = async () =>{
    let col = await metadata()
    let found = await col.updateOne(
        { _id: "metadata" },
        { $set: { timestamp: new Date().toISOString() } },
        { upsert: true }
      );
    if(!found) throw new Error("updatePullTimestamp: failed to update.")
}

export const getPullTimestamp = async () =>{
    let col = await metadata()
    let obj = await col.findOne({ _id: "metadata" });
    if(!obj) throw new Error("getPullTimeStamp: failed to get metadata.")
    return obj.timestamp
}