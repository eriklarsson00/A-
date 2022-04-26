import React, { useEffect } from "react";
import { StyleSheet, View, FlatList, } from "react-native";
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
import { MyCommunitysInfo, UserInfo } from "../assets/AppContext";
import { io } from "socket.io-client";
import { getRequests, getMyRequests, addTransaction, getPendingTransactions,} from "../Services/ServerCommunication";
import { host } from "../Services/ServerHost";
import { RequestedInfoModal } from "./Modals/RequestedInfoModal"
import { GiveProductModal } from "./Modals/GiveProductModal";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MyRequestsModal } from "./Modals/MyRequestsModal"
import {RequestTransactionInfoModal} from "./Modals/RequestTransactionModal"
export const ItemRequestedComponent = () => {
  const { userInfo, setUserInfo } = React.useContext(UserInfo);
  const { myCommunitysInfo, setMyCommunitysInfo } =
    React.useContext(MyCommunitysInfo);
  const [myRequests, setMyRequests] = React.useState([]);
  const [requests, setRequests] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const { community } = React.useContext(MyCommunitysInfo);
  const isFocused = useIsFocused();
  const [date, setDate] = React.useState(new Date());
  const [takeProduct, setTakeProduct] = React.useState(false);
  const [transactions, setTransactions] = React.useState([]);
  const userId = userInfo.id;
  const communityIds = myCommunitysInfo.map(({ id }) => id);

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

    socketRef.current.emit("communities", {
      ids: communityIds.map((id) => id.toString()),
    });

    socketRef.current.on("request", (request) => {
      request.visible = false;
      if (request.user_id == userId) {
        setMyRequests([...myRequests, request]);
      } else {
        setRequests([...requests, request]);
      }
    });

    socketRef.current.on("deleteRequest", (id) => {
      console.log(id);
      removeRequest(myRequests, id);
      removeRequest(requests, id);
      setRequests([...requests]);
      setMyRequests([...myRequests]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const fetchItems = async () => {
      setLoading(true);
      let myItems = await getMyRequests(userId);
      let otherItems = await getRequests(userId, communityIds);
      setMyRequests(myItems);
      setRequests(otherItems);
    let transactions = await getPendingTransactions(userId);
    setTransactions(transactions);
     setLoading(false);
    };


  const getTransaction = (request) => {
    if (!requestHasTransaction(request)) {
      return null;
    }
    return transactions.find(({ request_id }) => request_id == request.id);
  };

  const removeRequest = (array, id) => {
    return array.filter((request) => request.id != id);
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

    console.log(transaction);

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
  ) => 
    
    (
    <View>
      <ListItem
        style={styles.container}
        title={`${item.product_text}`}
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

    return (
      <View>
        <ListItem
        style={styles.container}
        title={`${item.product_text}`}
        description={`${item.description}`}
        onPress={() => {
          toggleModal(item);
        }}
      />
        {modal}
      </View>
    );
  };

  const flatListHeader = () => {
    return (
      <Text category={"h5"} style={{ marginTop: 20, marginLeft: 11 }}>
        Mina efterfrågningar
      </Text>
    );
  };

  const flatListFooter = () => {
    return (
      <>
        <Text category={"h5"} style={{ marginTop: 20, marginLeft: 11 }}>
          Efterfrågade varor
        </Text>
        <List
          scrollEnabled={false}
          data={requests}
          ItemSeparatorComponent={Divider}
          renderItem={renderRequestedItem}
        />
      </>
    );
  };

  const LoadingView = () => (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Spinner size={"giant"} />
    </View>
  );

  const LoadedView = () => (
    <FlatList
      data={myRequests}
      ItemSeparatorComponent={Divider}
      renderItem={renderMyItems}
      ListHeaderComponent={flatListHeader}
      ListFooterComponent={flatListFooter}
    >
      {community &&
        community.map((name) => (
          <Text category={"h5"} style={{ marginTop: 20, marginLeft: 11 }}>
            Efterfrågas i {name}{" "}
          </Text>
        ))}
    </FlatList>
  );

  return loading ? <LoadingView /> : <LoadedView />;
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
  },
});
