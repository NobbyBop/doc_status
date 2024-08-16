import { events } from "../config/mongoCollections.js";
import { validateEvents, validateEvent, validateFolders, validateDates } from "../validation.js";
export const createEvent = async (ev) => {
    validateEvent(ev)
    let col = await events()
    let added = await col.insertOne({
        id: ev.id,
        timestamp: ev.timestamp,
        actor: ev.actor,
        type: ev.type,
        action: ev.action,
        data: {
            target_path: ev.data.target_path,
            is_folder: ev.data.is_folder
        },
        action_source: ev.action_source
    })
    if(!added) throw new Error("createEvent: failed to insert into MongoDB.")
    else return added
}

export const getEvents = async () =>{
    let col = await events()
    let all = await col.find().toArray()
    if(!all) throw new Error("getEvents: failed to get all events.")
    all.sort((a, b) =>{
        let dateA = new Date(a.timestamp)
        let dateB = new Date(b.timestamp)
        if(dateA.getTime() < dateB.getTime()) return 1
        else return -1
    })
    return all
}

export const getEventsFiltered = async (projects, subfolders, startDate, endDate) => {
    validateFolders(projects)
    validateFolders(subfolders)
    validateDates(startDate, endDate)
    let events = await getEvents()
    if(projects){
        events = events.filter((ev)=>{
            for(let loc of projects){
                if(ev.data.target_path.startsWith(`/Projects/${loc}/`))
                    return true
            }
            return false
        })
    }
    if(subfolders){
        events = events.filter((ev)=>{
            for(let subf of subfolders){
                if(ev.data.target_path.includes(`/${subf}/`))
                    return true
            }
            return false
        })
    }
    if(startDate){
        events = events.filter((ev)=>{
            return new Date(ev.timestamp).getTime() >= new Date(startDate).getTime();
        })
    }
    if(endDate){
        events = events.filter((ev)=>{
            let end = new Date(endDate)
            end.setHours(23, 59, 59, 999);
            return new Date(ev.timestamp).getTime() <= end.getTime();
        })
    }
    return events
}
/*
Sample request

const url = 'https://apidemo.egnyte.com/pubapi/v1/events/cursor';
const token = '68zc95e3xv954u6k3hbnma3q';
try {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
    }

    const data = await response.json();
    console.log(data);
} catch (error) {
    console.error('There was a problem with the fetch operation:', error);
}
*/

// let events = generateEvents();
// console.log("Sample Report");
// generateReport(events);

export function generateTree(events){
    validateEvents(events)
    let projects = []
    let subfolders = []
    for(let ev of events){
        let path = ev.data.target_path
        let dirs = path.split("/").slice(2)
        if(dirs.length > 0){
            if(!projects.includes(dirs[0])) projects.push(dirs[0])
        }
        if(dirs.length > 1){
            if(!subfolders.includes(dirs[1])) subfolders.push(dirs[1])
        }
    }
    projects.sort()
    subfolders.sort()
    return {projects, subfolders}
}