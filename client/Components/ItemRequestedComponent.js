import React, { useEffect } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import {
  Text,
  List,
  Divider,
  ListItem,
  Modal,
  Card,
  Spinner,
  Button,
  Icon,
} from "@ui-kitten/components";
import { useIsFocused } from "@react-navigation/native";
import {
  MyCommunitysInfo,
  ShowCommunityIds,
  UserInfo,
} from "../assets/AppContext";
import { io } from "socket.io-client";
import {
  getRequests,
  getMyActiveRequests,
  addTransaction,
  getPendingTransactions,
} from "../Services/ServerCommunication";
import { host } from "../Services/ServerHost";
import { RequestedInfoModal } from "./Modals/RequestedInfoModal";
import { GiveProductModal } from "./Modals/GiveProductModal";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MyRequestsModal } from "./Modals/MyRequestsModal";
import { RequestTransactionInfoModal } from "./Modals/RequestTransactionModal";
import moment from "moment";
import "moment/locale/sv";
export const ItemRequestedComponent = () => {
  const { userInfo, setUserInfo } = React.useContext(UserInfo);
  const { myCommunitysInfo, setMyCommunitysInfo } =
    React.useContext(MyCommunitysInfo);
  const { showCommunityIds } = React.useContext(ShowCommunityIds);
  const [myRequests, setMyRequests] = React.useState([]);
  const [requests, setRequests] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const { community } = React.useContext(MyCommunitysInfo);
  const isFocused = useIsFocused();
  const [date, setDate] = React.useState(new Date());
  const [takeProduct, setTakeProduct] = React.useState(false);
  const [transactions, setTransactions] = React.useState([]);
  const userId = userInfo.id;
  const communityIds = showCommunityIds;

  const TransactionIcon = (props) => (
    <Icon {...props} fill="red" name="info-outline" />
  );
  //fetch items on focus
  useEffect(() => {
    if (isFocused) fetchItems();
  }, [isFocused]);

  const socketRef = React.useRef();

  //WebSocket handling
  React.useEffect(() => {
    socketRef.current = io(host);

    socketRef.current.on("request", (requestobj) => {
      const request = requestobj.request;
      const communities = requestobj.communities;
      if (
        request.user_id != userId &&
        communities?.map((i) => communityIds?.includes(i)).includes(true)
      )
        addRequest(request);
    });

    socketRef.current.on("deleteRequest", (id) => {
      removeRequest(id);
    });

    socketRef.current.on("transaction", (transaction) => {
      updateTransactions(transaction);
      if (transaction.request_id != null) removeRequest(transaction.request_id);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [requests, transactions]);

  const fetchItems = async () => {
    setLoading(true);
    let myItems = await getMyActiveRequests(userId);
    let otherItems = await getRequests(userId, communityIds);
    setMyRequests(myItems);
    setRequests(otherItems);
    let transactions = await getPendingTransactions(userId);
    setTransactions(transactions);
    setLoading(false);
  };

  const removeTransaction = (id) => {
    return setTransactions(
      transactions.filter((transaction) => transaction.id != id)
    );
  };
  const updateTransactions = (transaction) => {
    setTransactions([...transactions, transaction]);
  };

  const addRequest = (request) => {
    setRequests([...requests, request]);
  };

  const removeRequest = (id) => {
    return setRequests(requests.filter((request) => request.id != id));
  };

  const removeMyRequest = (id) => {
    return setMyRequests(myRequests.filter((request) => request.id != id));
  };

  const getTransaction = (request) => {
    if (!requestHasTransaction(request)) {
      return null;
    }
    return transactions.find(({ request_id }) => request_id == request.id);
  };

  const requestHasTransaction = (request) => {
    return getTransactionIds().includes(request.id);
  };

  const getTransactionIds = () => {
    return transactions.map(({ request_id }) => request_id);
  };
  const toggleVisible = (array, item) => {
    return array.map((request) => {
      if (request == item) {
        request.visible = !request.visible;
      }
    });
  };

  const makeTransaction = async (item) => {
    const transaction = {
      offer_id: null,
      request_id: item.id,
      status: "pending",
      responder_id: userId,
      time_of_creation: new Date(),
      time_of_expiration: date,
    };

    await addTransaction(transaction);
    fetchItems();
    toggleModal(item);
  };

  const toggleModal = (item) => {
    toggleVisible(requests, item);
    toggleVisible(myRequests, item);
    setTakeProduct(false);
    setRequests([...requests]);
    setMyRequests([...myRequests]);
  };

  const renderMyItems = (
    { item } //Used for rendering my items
  ) => (
    <View key={item.id}>
      <ListItem
        style={styles.container}
        title={`${item.product_text} | ${item.quantity} ${item.unit ?? ""}`}
        accessoryRight={requestHasTransaction(item) ? TransactionIcon : null}
        description={`${item.description}`}
        onPress={() => {
          toggleModal(item);
        }}
      />
      <RequestTransactionInfoModal
        item={item}
        text={"vill ge dig denna vara"}
        toggleModal={toggleModal}
        transaction={getTransaction(item)}
        removeTransaction={removeTransaction}
        removeMyRequest={removeMyRequest}
      />
    </View>
  );
  const updateDate = (date) => {
    setDate(date);
  };

  const toggleTake = () => {
    setTakeProduct(!takeProduct);
  };
  const renderRequestedItem = ({ item }) => {
    let infoModal = (
      <RequestedInfoModal
        item={item}
        toggleModal={toggleModal}
        toggleTake={toggleTake}
      />
    );

    let giveProductModal = (
      <GiveProductModal
        item={item}
        date={date}
        toggleModal={toggleModal}
        updateDate={updateDate}
        makeTransaction={makeTransaction}
      />
    );

    let modal = !takeProduct ? infoModal : giveProductModal;
    if (takeProduct) {
    }
    return (
      <View key={item.id}
>
        <ListItem
          style={styles.container}
          accessoryRight={() => {
            return (
              <Text style={{ top: 25, fontSize: 10 }}>
                {" "}
                {moment(item.time_of_creation).fromNow()}
              </Text>
            );
          }}
          title={`${item.product_text} | ${item.quantity} ${item.unit ?? ""}`}
          description={`${item.description}`}
          onPress={() => {
            toggleModal(item);
          }}
        />
        {modal}
      </View>
    );
  };

  const LoadingView = () => (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Spinner size={"giant"} />
    </View>
  );

  const LoadedView = () => (
    <View>
      <Text category={"h5"} style={{ marginTop: 20, marginLeft: 11 }}>
        Mina Efterfrågningar
      </Text>
      {myRequests.map((request) => {
        
        return renderMyItems({ item: request });
      })}
      <Text category={"h5"} style={{ marginTop: 20, marginLeft: 11 }}>
        Efterfrågade Varor
      </Text>
      {requests.map((request) => {
      
        return renderRequestedItem({ item: request });
      })}
    </View>
  );

  return loading ? (
    <LoadingView />
  ) : (
    <ScrollView>
      <LoadedView />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    marginTop: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    marginTop: 15,
    height: 80,
    marginRight: 10,
    marginLeft: 10,
    borderRadius: 10,
  },
});
