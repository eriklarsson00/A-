import { FlatList, StyleSheet, View } from "react-native";
import { Icon, List, ListItem, Spinner, Text } from "@ui-kitten/components";
import {
  getOngoingTransactionsResponder,
  responderConfirmTransaction,
} from "../Services/ServerCommunication";
import { useContext, useEffect, useRef, useState } from "react";

import { AwaitingConfirmationModal } from "./Modals/AwaitingConfirmationModal";
import { OwnerContactInformationModal } from "./Modals/OwnerContactInformationModal";
import { RatingModal } from "./Modals/RatingModal";
import { UserInfo } from "../assets/AppContext";
import { host } from "../Services/ServerHost";
import io from "socket.io-client";
import { useIsFocused } from "@react-navigation/native";

const GiveAwayIcon = (props) => (
  <Icon {...props} fill={"red"} name="arrow-circle-up" />
);

const ReceiveIcon = (props) => (
  <Icon {...props} fill={"green"} name="arrow-circle-down" />
);

export const AnsweredListingsTransactions = () => {
  const { userInfo } = useContext(UserInfo);
  const [responderTransactions, setResponderTransactions] = useState([]);
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(false);

  const isFocused = useIsFocused();
  const uid = userInfo.id;

  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io(host);

    socketRef.current.on("acceptedTransaction", (id) => {
      moveToResponder(id);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [responderTransactions, pendingTransactions]);

  const moveToResponder = (id) => {
    const transaction = getTransaction(id);
    if (transaction != undefined) {
      transaction.status = "accepted";
      setPendingTransactions(
        pendingTransactions.filter((transaction) => transaction.id != id)
      );
      setResponderTransactions([...responderTransactions, transaction]);
    }
  };

  const getTransaction = (id) => {
    return pendingTransactions.find((transaction) => transaction.id == id);
  };

  const fetchTransactions = async () => {
    setLoading(true);
    let pending = [];
    let accepted = [];
    let alltransactions = await getOngoingTransactionsResponder(uid);
    for (const trans of alltransactions) {
      if (trans.status === "pending") {
        pending.push(trans);
      } else {
        accepted.push(trans);
      }
    }
    setPendingTransactions(pending);
    setResponderTransactions(accepted);
    setLoading(false);
  };

  useEffect(() => {
    if (isFocused) fetchTransactions();
  }, [isFocused]);

  const toggleVisible = (array, item) => {
    return array.map((offer) => {
      if (offer == item) {
        offer.visible = !offer.visible;
      }
    });
  };

  const toggleModal = (item) => {
    toggleVisible(responderTransactions, item);
    toggleVisible(pendingTransactions, item);
    setResponderTransactions([...responderTransactions]);
    setPendingTransactions([...pendingTransactions]);
  };

  const toggleRating = () => {
    setRating(!rating);
  };

  const ratingCompleted = () => {
    setRating(!rating);
    fetchTransactions();
  };

  const confirmTransaction = async (id) => {
    await responderConfirmTransaction(id);
  };

  const whatToRender = (opt1, opt2) => {
    if (opt1 !== null) {
      return `${opt1} `;
    } else {
      return `${opt2} `;
    }
  };

  const renderTransactionIcon = (offer) => {
    if (!offer) {
      return GiveAwayIcon;
    } else {
      return ReceiveIcon;
    }
  };

  const renderGiveOrTake = (offer_product_name, request_product_name) => {
    if (!offer_product_name) {
      return (
        <View
          style={{
            flexDirection: "row",
            marginBottom: 5,
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text>
            <Text category={"s1"}>{request_product_name} ska </Text>
            <Text category={"s1"} style={{ textDecorationLine: "underline" }}>
              ges bort
            </Text>
            <Text category={"s1"}> till</Text>
          </Text>
        </View>
      );
    } else {
      return (
        <View
          style={{
            marginBottom: 5,
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text>
            <Text category={"s1"}>{offer_product_name} ska </Text>
            <Text category={"s1"} style={{ textDecorationLine: "underline" }}>
              tas emot
            </Text>
            <Text category={"s1"}> från</Text>
          </Text>
        </View>
      );
    }
  };

  const renderAcceptedTransactions = ({ item }) => {
    let contactModal = (
      <OwnerContactInformationModal
        item={item}
        text={renderGiveOrTake(item.offer_product, item.request_product)}
        toggleModal={toggleModal}
        toggleRating={toggleRating}
        confirmTransaction={confirmTransaction}
      />
    );

    let ratingModal = (
      <RatingModal
        item={item}
        toggleModal={toggleModal}
        ratingCompleted={ratingCompleted}
      />
    );

    let modal = !rating ? contactModal : ratingModal;

    return (
      <View>
        <ListItem
          style={styles.container}
          onPress={() => toggleModal(item)}
          accessoryLeft={renderTransactionIcon(item.offer_product)}
          title={whatToRender(item.offer_product, item.request_product)}
          description={whatToRender(
            item.offer_description,
            item.request_description
          )}
        />
        {modal}
      </View>
    );
  };

  const flatListHeader = () => {
    return (
      <Text category={"h5"} style={{ marginTop: 20, marginLeft: 11 }}>
        Bekräftade utbyten
      </Text>
    );
  };

  const renderPendingTransactions = ({ item }) => {
    return (
      <View>
        <ListItem
          style={styles.container}
          onPress={() => toggleModal(item)}
          accessoryLeft={renderTransactionIcon(item.offer_product)}
          title={whatToRender(item.offer_product, item.request_product)}
          description={whatToRender(
            item.offer_description,
            item.request_description
          )}
        />
        <AwaitingConfirmationModal
          item={item}
          text={renderGiveOrTake(item.offer_product, item.request_product)}
          toggleModal={toggleModal}
        />
      </View>
    );
  };

  const flatListFooter = () => {
    return (
      <View>
        <Text category={"h5"} style={{ marginTop: 20, marginLeft: 11 }}>
          Inväntar bekräftelse
        </Text>
        <List
          scrollEnabled={false}
          data={pendingTransactions}
          renderItem={renderPendingTransactions}
        />
      </View>
    );
  };

  const LoadingView = () => (
    <View
      style={{
        marginTop: 370,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Spinner size={"giant"} />
    </View>
  );

  const LoadedView = () => (
    <FlatList
      style={{ flex: 1 }}
      data={responderTransactions}
      renderItem={renderAcceptedTransactions}
      ListHeaderComponent={flatListHeader}
      ListFooterComponent={flatListFooter}
    />
  );

  return loading ? <LoadingView /> : <LoadedView />;
};

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    height: 100,
    marginRight: 10,
    marginLeft: 10,
    borderRadius: 10,
  },
});
