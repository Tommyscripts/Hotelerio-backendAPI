const RoomModel = require('../models/rooms.model')
const ReservModel = require('../models/reservation.model')
const { handleError } = require('../utils')

module.exports = {
  getAllRooms,
  getRoomById,
  updateRoom,
  createRoom,
  deleteRoomById,
  getAvailable,
  checkAvailable
}

function getAllRooms(req, res) {
  RoomModel
    .find(req.query)
    .then(response => res.json(response))
    .catch((err) => handleError(err, res))

}

function getRoomById(req, res) {
  RoomModel
    .findById(req.params.id)
    .then(response => res.json(response))
    .catch((err) => handleError(err, res))
}

function deleteRoomById(req, res) {
  RoomModel
    .remove({ _id: req.params.id })
    .then(response => res.json(response))
    .catch(err => handleError(err, res))
}

function updateRoom(req, res) {
  RoomModel
    .findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    .then(response => res.json(response))
    .catch((err) => handleError(err, res))
}
function createRoom(req, res) {
  RoomModel.create(req.body)
    .then((room) => res.json(room))
    .catch((err) => res.json(err))
}

function getAvailable(req, res) {
  RoomModel
    .find({ occupied: false })
    .then(response => {
      let capacity = response.map(e => e.capacity)
      if (capacity !== undefined) {
        let filter = response.filter(e => {
          return e.capacity >= req.query.capacity
        })
        res.json(filter)
      } else {
        res.json(response)
      }
    })
    .catch((err) => handleError(err, res))

}

//Filter using queries, gte(greatherThanOrEqualTo), lte(LesserThanOrEqualTo)
function checkAvailable(req, res) {
  const userCheckin = new Date(req.body.checkin)
  const userCheckout = new Date(req.body.checkout)

  ReservModel
    .find({ $or: [{ $and: [{ checkin: { $lte: userCheckin } }, { checkout: { $gte: userCheckin } }] }, { $and: [{ checkin: { $lte: userCheckout } }, { checkout: { $gte: userCheckout } }] }] })
    .then(result => {
      const roomIds = result.map(el => el.room.toString())
      RoomModel
        .find({_id: {$nin: roomIds}})
        .then(result => res.json(result))
        .catch((err) => handleError(err, res))
    })
    .catch((err) => handleError(err, res))
}
