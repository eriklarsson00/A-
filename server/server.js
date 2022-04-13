import "dotenv/config";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

/*
*************************
    SERVER SETUP
*************************
*/

const express = require("express");
const app = express();
const socketio = require("socket.io");
const fs = require("fs");
const http = require("http");
const https = require("https");
app.use(express.json());

let sslKey;
let sslCert;
let sserver;
if (process.env.NODE_ENV === "prod") {
  sslKey = fs.readFileSync("ca.key", "utf8");
  sslCert = fs.readFileSync("ca.crt", "utf8");
  sserver = https.createServer({ key: sslKey, cert: sslCert }, app);
}

const server = http.createServer(app);

/*
*************************
    WebSocket SETUP
*************************
*/

const io = socketio(server);

io.on("connection", (socket) => {
  const connectedClients = () => {
    return `${io.of("/").sockets.size} clients connected`;
  };
  console.log(socket.id, "has connected");
  socket.emit(
    "message",
    `Connected to WebSocket server\n ${connectedClients()}`
  );

  socket.on("communities", (communities) => {
    console.log(communities);
    socket.join(communities.ids);
  });

  socket.broadcast.emit(
    "message",
    `A new client connected to the WebSocket server\n ${connectedClients()}`
  );

  socket.on("disconnect", () => {
    io.emit(
      "message",
      `A client has disconnected from the server \n ${connectedClients()}`
    );
  });
});

/*
*************************
    REST API ROUTES
*************************
*/

import * as users from "./routes/users.js";
import * as login from "./routes/login.js";
import * as communities from "./routes/communities.js";
import * as offers from "./routes/offers.js";
import * as requests from "./routes/requests.js";
import * as transactions from "./routes/transactions.js";
import * as products from "./routes/products.js";
import * as ci from "./routes/ci.js";
import { upload, uploadImageOnS3 } from "./routes/upload.js";

//*************************CI*************************

app.route("/ci/deploy").post(ci.deployServer);

//*************************PRODUCTS*************************

app.route("/products/:gtin").get(products.getProduct);

//*************************USERS*************************

app.route("/users").get(users.getUsers).post(users.addUser);

app
  .route("/users/:id")
  .get(users.getUser)
  .put(users.updateUser)
  .delete(users.deleteUser);

app.route("/users/email/:email").get(users.getUserEmail);

app
  .route("/users/community")
  .post(users.addUserToCommunity)
  .delete(users.removeUserFromCommunity);

app.route("/users/community/:id").get(users.getUserCommunities);

app.post(
  "/users/profile/:id",
  upload.single("image"),
  users.updateProfilePicture
);

//*************************LOGIN*************************

app.route("/login").post(login.userExists);

//*************************COMMUNITIES*************************

app
  .route("/communities")
  .get(communities.getCommunities)
  .post(communities.addCommunity);

app
  .route("/communities/:id")
  .get(communities.getCommunity)
  .put(communities.updateCommunity)
  .delete(communities.deleteCommunity);

app.route("communities/members/:id").get(communities.getCommunityMembers);

//*************************OFFERS*************************

app.route("/offers/active").get(offers.getActiveOffers);

app.route("/offers/active/:community").get(offers.getActiveOffersCommunity);

app
  .route("/offers")
  .get(offers.getOffers)
  .post((req, res) => {
    offers.addOffer(req, res);
    const communities = req.body.communities;
    communities?.forEach((community) => {
      io.sockets.to(community).emit("offer", req.body.offer);
    });
  });

app
  .route("/offers/:id")
  .get(offers.getOffer)
  .put(offers.updateOffer)
  .delete((req, res) => {
    offers.deleteOffer(req, res);
    io.sockets.emit("deleteOffer", req.params.id);
  });

app.route("/offers/user/:id").get(offers.getUserOffers);

app.route("/offers/other/:user").get(offers.getOtherOffersCommunity);

//*************************REQUESTS*************************

app.route("/requests/active").get(requests.getActiveRequests);

app
  .route("/requests/active/:community")
  .get(requests.getActiveRequestsCommunity);

app
  .route("/requests")
  .get(requests.getRequests)
  .post((req, res) => {
    requests.addRequest(req, res);
    const communities = req.body.communities;
    communities?.forEach((community) => {
      io.sockets.to(community).emit("request", req.body.request);
    });
  });

app
  .route("/requests/:id")
  .get(requests.getRequest)
  .put(requests.updateRequest)
  .delete((req, res) => {
    requests.deleteRequest(req, res);
    io.sockets.emit("deleteRequest", req.params.id);
  });

app.route("/requests/user/:id").get(requests.getUserRequests);

app.route("/requests/other/:user").get(requests.getOtherRequestsCommunity);

//*************************TRANSACTIONS*************************

app
  .route("/transactions")
  .get(transactions.getTransactions)
  .post(transactions.addTransaction);

app
  .route("/transactions/:id")
  .put(transactions.updateTransaction)
  .get(transactions.getTransaction)
  .delete(transactions.deleteTransaction);

app
  .route("/transactions/community/:id")
  .get(transactions.getTransactionCommunity);

app
  .route("/transactions/responder/:id")
  .get(transactions.getResponderTransactions);

app.route("/transactions/lister/:id").get(transactions.getListerTransactions);

//*************************IMAGES*********************

app.post("/itemimages", upload.single("image"), (req, res) => {
  try {
    uploadImageOnS3(req.file, "itemImages/" + req.file.filename);
    res.json(
      "https://matsamverkan.s3.us-east-1.amazonaws.com/" + req.file.filename
    );
  } catch (err) {
    res.status(500);
    res.json("Upload failed: " + err);
  }
});
//*************************SERVER*************************

if (sserver) {
  const httpsMsg = `Listening to port ${process.env.SERVER_PORT_HTTPS} with auto reload!`;
  sserver.listen(process.env.SERVER_PORT_HTTPS, () => console.log(httpsMsg));
}

const httpMsg = `Listening to port ${process.env.SERVER_PORT_HTTP} with auto reload!`;
server.listen(process.env.SERVER_PORT_HTTP, () => console.log(httpMsg));

export { server }; // Needed for testing purposes
