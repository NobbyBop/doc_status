function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function validateEvents(events, param){
    if(events === undefined || !Array.isArray(events)){
        throw new Error(`validateEvents: ${param} is not an array.`)
    }
    if(events.length === 0) throw new Error(`validateEvents: ${param} is empty.`)
    for(let e of events){
       try{
            validateEvent(e)
        } catch(err) {
            throw new Error(`validateEvents: ${param} contains invalid event(s).`)
        }
    }
}

export function validateEvent(e, param){
    if(!isObject(e)) throw new Error(`validateEvent: ${param} is an invalid event.`)
    if(!e.timestamp || !e.action || !e.actor || 
        !e.data || !e.data.target_path || !e.id || !e.type ||
        e.data.is_folder === undefined || !e.action_source) throw new Error(`validateEvent: ${param} is an invalid event.`)
    if(!e.data.target_path.startsWith("/Projects/")) throw new Error(`validateEvent: ${param} path is out of scope.`)
}

export function validateFolders(fs, param){
    if(fs === undefined) return
    if(!Array.isArray(fs)){
        throw new Error(`validateFolders: ${param} is not an array.`)
    }
    if(fs.length === 0) throw new Error(`validateFolders: ${param} is empty.`)
    for(let f of fs){
        if(f === undefined || typeof f !== "string") throw new Error(`validateFolders: ${param} contains a non-string.`)
        if(f.trim().length === 0) throw new Error(`validateFolders: ${param} contains an empty string.`)
    }
}

export function validateDates(startDate, endDate, param1, param2){
    let sd, ed
    if(startDate !== "" && startDate !== undefined){
        if(typeof startDate !== "string") throw new Error(`validateDates: ${param1} not a string`)
        if(!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(startDate)) throw new Error(`validateDates: ${param1} is in incorrect format.`)
        sd = new Date(startDate)
    } else {
        sd = new Date("1970-01-01")
    }
    if(endDate !== "" && endDate !== undefined){
        if(typeof endDate !== "string") throw new Error(`validateDates: ${param2} not a string`)
        if(!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(endDate)) throw new Error(`validateDates: ${param2} is in incorrect format.`)
        ed = new Date(endDate)
    } else {
        ed = new Date("9999-12-31")
    }
    if(ed < sd) throw new Error(`validateDates: ${param2} is before ${param1}`)
}