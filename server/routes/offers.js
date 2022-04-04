import { offerChecker } from "./modelchecker.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const knex = require("knex")({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
});

function getActiveOffersCommunity(req, res) {
  const community = parseInt(req.params.community);

  if (isNaN(community)) {
    return res.status(400).json("Usage: /offers/:id. id has to be a number");
  }

  knex("Offers")
    .select("Offers.*")
    .leftJoin("Transactions", "Transactions.offer_id", "Offers.id")
    .leftJoin("CommunityListings", "CommunityListings.offer_id", "Offers.id")
    .where("Transactions.offer_id", null)
    .andWhere("CommunityListings.community_id", community)
    .then((offers) => {
      res.json(offers);
    });
}

function getActiveOffers(req, res) {
  knex("Offers")
    .select("Offers.*")
    .leftJoin("Transactions", "Transactions.offer_id", "Offers.id")
    .where("Transactions.offer_id", null)
    .then((offers) => {
      res.json(offers);
    });
}

function getOffers(req, res) {
  knex("Offers")
    .select()
    .then((offers) => {
      res.json(offers);
    });
}

function getOffer(req, res) {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json("Usage: /offers/:id. id has to be a number");
  }

  knex("Offers")
    .select()
    .where("id", id)
    .then((offers) => {
      res.json(offers);
    });
}

function addOffer(req, res) {
  const body = req.body;
  const offer = body.offer;
  const communities = body.communities;

  if (!body || !offerChecker(offer))
    return res.status(400).json("Invalid offer properties");

  let offer_id = -1;
  knex("Offers")
    .insert(offer)
    .catch((err) => {
      res.status(500).json(err);
      return;
    })
    .then((id) => {
      if (id !== undefined) res.json("User inserted with id: " + id);
      offer_id = id;
    })
    .then(() => {
      if (offer_id == -1 || !communities) return;
      communities.forEach((community) => {
        knex("CommunityListings").insert({
          community_id: community,
          offer_id: offer_id,
        });
      });
    });
}

function updateOffer(req, res) {
  const id = parseInt(req.params.id);
  const body = req.body;

  if (!offerChecker(body))
    return res.status(400).json("Invalid offer properties");

  if (isNaN(id)) {
    return res.status(400).json("Usage: /offers/:id. id has to be a number");
  }

  knex("Offers")
    .where("id", id)
    .update(body)
    .catch((err) => {
      res.status(500).json(err);
      id = undefined;
    })
    .then(() => {
      if (id !== undefined) res.json("Community updated with id: " + id);
    });
}

function deleteOffer(req, res) {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json("Usage: /offers/:id. id has to be a number");
  }

  knex("Offers")
    .where("id", id)
    .delete()
    .catch((err) => {
      res.status(500).json(err);
      id = undefined;
    })
    .then(() => {
      if (id !== undefined) res.json("Offer has been removed");
    });
}

export {
  getActiveOffersCommunity,
  getActiveOffers,
  getOffers,
  getOffer,
  addOffer,
  deleteOffer,
  updateOffer,
};
