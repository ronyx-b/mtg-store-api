const DataService = require("./index");

/**
 * Gets a list of all sets from the DB
 * @async
 * @param {{pageSize: number|string, pageNum: number|string}} [pagination] sets pagination por results
 * @returns 
 */
const getAllFeaturedSets = async (pagination = {pageSize: 10, pageNum: 1}) => {
  const db = await DataService.connect();
  const pageSize = Number(pagination.pageSize);
  const pageNum = Number(pagination.pageNum);
  let featuredSetList = [];
  if (!db.error) {
    featuredSetList = await db.model.FeaturedSet.find(
      {}, 
      null, 
      { 
        limit: pageSize, 
        skip: pageNum > 1 ? (pageNum - 1) * pageSize : 0,
        sort: {
          released_at: "desc",
        }
      }
    );
  }
  // db.connection.close();
  return featuredSetList;
};

/**
 * Gets the data from a single set by its set code
 * @async
 * @param {string} setCode 
 * @returns
 */
const getSetByCode = async (setCode) => {
  const db = await DataService.connect();
  let setData = {};
  if (!db.error) {
    setData = await db.model.FeaturedSet.findOne({ code: setCode })
  }
  return setData
} 

/**
 * Creates a new featured set
 * @async
 * @param {Object} setData 
 */
const addFeaturedSet = async (setData) => {
  try {
    const db = await DataService.connect();
    let existingSet = await db.model.FeaturedSet.findOne({ code: setData.code });
    if(existingSet) {
      throw "The set is already registered";
    }
    await db.model.FeaturedSet.create(setData);
  } catch (err) {
    throw `Error creating set: ${err}`;
  }
};

const setsController = {
  getAllFeaturedSets,
  getSetByCode,
  addFeaturedSet,
};

module.exports = setsController;