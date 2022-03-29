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

function getOffers(req, res) {
  console.log("GET Offers", new Date());
  knex("Offers")
    .select()
    .then((offers) => {
      res.json(offers);
    });
}

function getOffer(req, res) {
  const id = req.params.id;
  console.log("GET Offers/" + id, new Date());
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
  let offer_id = -1;
  knex("Offers")
    .insert(offer)
    .catch(() => {
      res.sendStatus(404);
      return;
    })
    .then((id) => {
      if (id !== undefined) res.json("User inserted with id: " + id);
      offer_id = id;
    })
    .then(() => {
      if (offer_id == -1) return;
      communities.forEach((community) => {
        knex("CommunityListings").insert({
          community_id: community,
          offer_id: offer_id,
        });
      });
    });
}

export { getOffers, getOffer, addOffer };
