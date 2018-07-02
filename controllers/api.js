const passport = require('passport');
const fs = require('fs');
// multer required for the file uploads
var multer = require('multer');
// var stripe = require('stripe')('sk_test_dhdveRA7pch0mMK9PpT8gHaH');
// set the directory for the uploads to the uploaded to
var DIR = './uploads/';
//define the type of upload multer would be doing and pass in its destination, in our case, its a single file with the name photo
// var upload = multer({ dest: DIR }).single('image');

const User = require('../models/User');
const Inventory = require('../models/inventory')
const InventoryUsage = require('../models/inventory-usage')

/**
 * POST /api/login
 * Sign in using email and password.
 */
exports.login = (req, res, next) => {
  console.log(req.body);
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password cannot be blank').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    console.log(errors);
    return res.status(401).json({errors :"email or password is invalid"});
  }

  passport.authenticate('local', (err, user, info) => {
    const error = err || info;
    if (error) {
      console.log(error);
      return res.status(401).json({errors:"email or password is invalid"});
    }
    if (!user) {
      console.log("User not found");
      return res.status(401).json({ errors: "Something went wrong, please try again."});
    }
    user = user.toJSON();
    res.json({
      user: user
    });
  })(req, res, next);
};

/**
 * POST /register
 * Create a new user account.
 */
exports.register = (req, res, next) => {
  console.log(req.body);
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    console.log(errors);
    return res.status(401).json({errors:{'email or password': ["is invalid"]}});
  }

  const user = new User({
    email: req.body.email,
    password: req.body.password,
    username: req.body.username
  });

  User.findOne({ email: req.body.email }, (err, existingUser) => {
    if (err) {
      console.log(errors);
      return res.status(401).json(errors);
    }
    if (existingUser) {
      return res.status(401).json({ error: "Email already exist"});
    }
    user.save((err) => {
      if (err) {
        return res.status(401).json({ error: 'Something went wrong, please try again.'});
      }
      return res.json({
        user: user
      });
    });
  });
};



// add inventory
exports.Inventory = (req, res, next) => {
  console.log(req.body);

  const inventory = new Inventory({
    title : req.body.title,
    description: req.body.description,
    quantity: req.body.quantity,
    createdBy:req.body.createdBy,
    updatedBy:req.body.updatedBy
  });

  inventory.save((err) => {
      if (err) {
        return res.status(401).json({ error: 'Something went wrong, please try again.'});
      }
      return res.json({
        inventory: inventory
    });
  });
};

// getInventory
exports.getInventory = (req, res, next) => {
  console.log(req.body);

  Inventory.find(function(err,inventory) {
    if (err) {
      return res.status(401).json({ error: 'Something went wrong, please try again.'});
    }
    return res.json({
       inventory
    })
  })
};


// get inventory by id
exports.getInventorybyId = async (req, res, next) => {
console.log(req.params.inventoryId);

var data = await Inventory.find({ '_id': { $in:  req.params.inventoryId } },function(err,inventory) {
  if (err) {
    return res.status(401).json({ error: 'Something went wrong, please try again.'});
  }
  return inventory;
})
var dataHistory = await InventoryUsage.find({ 'inventoryId': { $in:  req.params.inventoryId } }, function (err, result) {
}).then(responce => {
    return responce;
});
res.json({detail:data,history:dataHistory});
};

/**
 * PUT /user
 * update inventory details
 */
exports.updateInventory = (req, res, next) => {
  const inventoryId = req.body.inventoryId;
  const updatedInventory = req.body.inventory;

  Inventory.findOne({
    $and: [
      { "_id": { $in: inventoryId }},
    ]
   }, (err, inventory) => {
    if (err) { 
      console.log(err);
      return res.status(401).json({ errors: {'Token': ['invalid']}}); 
    }

    if (inventory) {
      Inventory.findById(inventoryId, (err, dbInventory) => {
        if (err) { 
          console.log(err);
          return res.status(401).json({ errors: {'dbInventory Id': [err]}}); 
        }
         dbInventory.title = updatedInventory.title;
         dbInventory.description = updatedInventory.description;
         dbInventory.quantity = updatedInventory.quantity;
         dbInventory.updatedBy = updatedInventory.updatedBy;

        dbInventory.save((err) => {
          return res.json({
            inventory: dbInventory
          });
        });
      });
    }
    else {
      return res.status(401).json({ errors: "This id doesnt exist"});
    }
  });
};





// deleteInventory
exports.deleteInventory = (req, res, next) => {
  console.log(req.body);
  Inventory.findByIdAndRemove(req.params.inventoryId, (err, todo) => {  
    // As always, handle any potential errors:
    if (err) return res.status(500).send(err);
    // We'll create a simple object to send back with a message and the id of the document that was removed
    // You can really do this however you want, though.
    const response = {
        message: "Todo successfully deleted",
        id: todo._id
    };
    return res.status(200).send(response);
  });
};

/**
 * GET /user
 * Get current user details
 */
exports.getCurrentUser = (req, res, next) => {
  if (!req.user) { 
    console.log(err);
    return res.status(401).json({ errors: {'Token': ['invalid']}}); 
  }
  return res.json({
    user: req.user
  });
};

/**
 * GET /user
 * Get user details
 */
exports.getUser = (req, res, next) => {
  console.log("test");
  const {userId} = req.params;

  if (!userId || userId === null) {
    return res.status(401).json({ errors: {'User Id': ['is required.']}});
  }

  User.findById(userId, (err, user) => {
    if (err) { 
      console.log(err);
      return res.status(401).json({ errors: {'User Id': [err]}}); 
    }
    return res.json({
      user: user
    });
  });
};


exports.deleteInventoryUsage =  (req, res, next) => {
  console.log(req.body);
  InventoryUsage.findByIdAndRemove(req.params.inventoryId, (err, data) => {  
    // As always, handle any potential errors:
    if (err) return res.status(500).send(err);
    // We'll create a simple object to send back with a message and the id of the document that was removed
    // You can really do this however you want, though.
    const response = {
        message: "successfully deleted",
        id: data._id
    };
    return res.status(200).send(response);
  });
};

exports.addInventoryUsage = (req, res, next) => {
  console.log(req.body);
  const inventoryUsage = new InventoryUsage({
    inventoryId : req.body.inventoryId,
    Usagequantity : req.body.quantity,
    description: req.body.description,
    usedBy:req.body.usedBy
  });

  inventoryUsage.save((err) => {
      if (err) {
        return res.status(401).json({ error: 'Something went wrong, please try again.'});
      }

      Inventory.findById(req.body.inventoryId, (err, dbInventory) => {
        if (err) { 
          console.log(err);
          return res.status(401).json({ errors: {'dbInventory Id': [err]}}); 
        }
         dbInventory.quantity = dbInventory.quantity - req.body.quantity;

        dbInventory.save((err) => {
        });
      });

      return res.json({
        inventoryUsage: inventoryUsage
    });
  });
};

