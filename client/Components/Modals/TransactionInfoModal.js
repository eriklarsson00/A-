import React, { useEffect, useState } from "react";
import { StyleSheet, View, Image, ScrollView, FlatList } from "react-native";
import {
  Text,
  List,
  ListItem,
  Modal,
  Card,
  Button,
  Layout,
  Spinner,
  Divider,
} from "@ui-kitten/components";
import moment from "moment";
import "moment/locale/sv";
import tw from "twrnc";
import {
  getUserProfileById,
  acceptTransaction,
  deleteTransaction,
} from "../../Services/ServerCommunication";

export const TransactionInfoModal = (props) => {
  const item = props.item;
  const transaction = props.transaction;
  const [responder, setResponder] = useState({});

  const getResponder = async () => {
    if (!transaction) return;
    let responder = await getUserProfileById(transaction.responder_id);
    setResponder(responder[0]);
  };
  const rating =
    responder.raters > 0
      ? Math.round((responder.rating * 10) / responder.raters) / 10 + "/5"
      : "Inga";
  
  useEffect(() => {
    getResponder();
  }, []);

  const accept = () => {
    acceptTransaction(transaction.id);
    props.removeTransaction(transaction.id)
    props.removeOffer(transaction.offer_id);
    props.toggleModal(item);
  };

  const decline = () => {
    deleteTransaction(transaction.id);
    props.removeTransaction(transaction.id)
    props.toggleModal(item);
  };

  const Info = () => {
    if (transaction) {
      return (
        <View>
          <View style={styles.imgContainer}>
           <Layout style={tw`py-10`}>
        <Image
          style={[tw`rounded-full`, {marginBottom: -40, marginTop: -10}]}
          source={{
            uri: responder.imgurl,
            height: 150,
            width: 150,
          }}
        />
      </Layout>
      <Layout style={styles.container}>
        <Card style={styles.card}>
          <Text style={[tw`text-center`, styles.text]}>{responder.given}</Text>
          <Divider />
          <Text style={[tw`text-center`, styles.text]}>Givet</Text>
        </Card>

        <Card style={styles.card}>
          <Text style={[tw`text-center`, styles.text]}>{responder.taken}</Text>
          <Divider />
          <Text style={[tw`text-center`, styles.text]}>Tagit</Text>
        </Card>

        <Card style={styles.card}>
          <Text style={[tw`text-center`, styles.text]}>{rating}</Text>
          <Divider />
          <Text style={[tw`text-center`, {fontSize: 10}]}>Betyg</Text>
        </Card>
      </Layout>
            <Text style={{marginBottom: 5} }category={"s1"}>{responder.firstname} {props.text} </Text>
          <Text style={{marginBottom: 5} } category={"s1"}>
            {moment(transaction.time_of_expiration).format("dddd Do MMM hh:mm")}
          </Text>
            <Text  style={{marginBottom: 5} }category={"s1"}>{moment(transaction.time_of_expiration).fromNow()}</Text>
            </View>
          <Layout
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 10,
            }}
          >
            <Button style={{marginLeft: 10, width: 120}} onPress={() => accept()} status={"success"}>
              <Text>Acceptera</Text>
            </Button>
            <Button style={{marginRight: 10, width: 120} }onPress={() => decline()} status={"danger"}>
              <Text>Neka</Text>
            </Button>
          </Layout>
        </View>
      );
    } else {
      return (
        <View>
          <View
            style={{
              flexDirection: "row",
              flex: 1,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Layout style={tw`py-10`}>
              <Image
                style={tw`rounded-full`}
                source={{
                  uri: item.imgurl,
                  height: 100,
                  width: 100,
                }}
              />
            </Layout>
            <Text category={"s1"} style={{ marginLeft: 20 }}>
              {item.product_text}
            </Text>
            <Text category={"s1"} style={{ marginLeft: 20 }}>
              {item.quantity}
            </Text>
          </View>

          <Text style={{ marginBottom: 10 }}>
            Utgångsdag: {moment(item.time_of_expiration).format("DD-MM-YYYY")}
          </Text>
          <Text style={{ marginBottom: 10 }}>
            Bruten förpackning: {item.broken_pkg ? "Japp" : "Nepp"}{" "}
          </Text>
          <Text style={{ marginBottom: 10 }}>Din vara</Text>
          <Text style={{ marginBottom: 10 }}>{item.description}</Text>
        </View>
      );
    }
  };

  return (
    <Modal //Modal for additional information about a product
      visible={item.visible}
      backdropStyle={{ backgroundColor: "rgba(0, 0, 0, 0.25)" }}
      onBackdropPress={() => props.toggleModal(item)}
    >
      <Card disabled={true} style={{ width: 320, flex: 1 }}>
        <Info />
      </Card>
    </Modal>
  );
};

const styles = StyleSheet.create({
  imgContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 20,
  },
  container: {
    paddingTop: 30,
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  card: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    margin: 5,
    width: "100%",
  },
  text: {
    fontSize: 12,
  
  }
})

export default TransactionInfoModal;
