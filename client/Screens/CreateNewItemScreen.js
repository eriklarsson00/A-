import React from "react";
import {
  SafeAreaView,
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
} from "react-native";
import {
  Button,
  useTheme,
  Layout,
  Icon,
  List,
  Modal,
  Card,
  Divider,
  Tooltip,
} from "@ui-kitten/components";
import tw from "twrnc";
import { InputNewItem } from "../Components/InputNewItem";
import BarCodeScannerComp from "../Components/BarCodeScanner.component";
import { MyCommunitysInfo } from "../assets/AppContext";
import { NewItemCommunityComponent } from "../Components/NewItemCommunityComponent";

const CreateNewItemScreen = () => {
  const { myCommunitysInfo, setMyCommunitysInfo } =
    React.useContext(MyCommunitysInfo);
  const [productInfo, setProductInfo] = React.useState([]);
  const [compId, setCompId] = React.useState(0);
  const [count, setCount] = React.useState([0]);
  const [productName, setProductName] = React.useState("");
  const [barCodeShow, setBarCodeShow] = React.useState(false);
  const [createPost, setCreatePost] = React.useState(false);
  const [chosenCommunity, setChosenCommunity] = React.useState([]);
  const [tooltipVisible, setTooltipVisible] = React.useState(false);
  const [images, setImages] = React.useState([]);

  const theme = useTheme();

  const PlusIcon = () => (
    <Icon style={styles.icon} fill="black" name="plus-circle-outline" />
  );

  // barcodescanner
  const product = (productName) => {
    setProductName(productName);
    console.log(productName);
  };
  const barCodeActive = (barCodeShow) => {
    setBarCodeShow(barCodeShow);
  };

  // koppla mellan parent och child
  const infoHandler = (input) => {
    setProductInfo((productInfo) => [...productInfo, input]);
  };
  const addId = (input) => {
    setCompId(compId + input);
  };

  const newComp = () => {
    const length = count.length;
    setCount((count) => [...count, length]);
  };

  const pushImage = (image) => {
    setImages([...images, image]);
  };

  const updateItem = (inputId, updatedItem) => {
    for (let i = 0; i < productInfo.length; i++) {
      if (productInfo[i].id === inputId) {
        console.log("productInfo[i].id = " + productInfo[i].id);
        let newProductInfo = [...productInfo];
        newProductInfo[i] = updatedItem;
        setProductInfo(newProductInfo);
        return;
      }
    }
    console.log("ERROR: no item with inputId found");
  };

  const addComp = ({ item, index }) => (
    <Layout>
      <InputNewItem
        setProductInfo={infoHandler}
        id={compId}
        setId={addId}
        setChange={updateItem}
        func={barCodeActive}
        product={productName}
        pushImage={pushImage}
      />
    </Layout>
  );

  const giveKey = ({ item, index }) => reuturn(item);

  const printMyCommunities = ({ item, index }) => (
    <Layout>
      <NewItemCommunityComponent community={item} addCommunity={addCommunity} />
    </Layout>
  );

  const addCommunity = (community, remove) => {
    for (let i = 0; i < chosenCommunity.length; i++) {
      if (chosenCommunity[i].id === community.id) {
        if (remove) {
          // om remove == falsk ska det community tas bort från listan
          let newChosenCommunity = chosenCommunity.filter(
            (com) => com.name != community.name
          );
          setChosenCommunity(newChosenCommunity);
          return;
        } else {
          return;
        }
      }
    }
    setChosenCommunity((chosenCommunity) => [...chosenCommunity, community]);
  };

  const renderPublishButton = () => (
    <Button
      onPress={() => {
        if (chosenCommunity.length == 0) {
          setTooltipVisible(true);
        }
      }}
    >
      Publicera inlägg
    </Button>
  );

  if (!barCodeShow) {
    return (
      <Layout style={styles.container}>
        <List
          style={styles.container_list}
          data={count}
          renderItem={addComp}
          key={giveKey}
        />

        <Layout
          style={{
            alignSelf: "left",
            paddingLeft: 30,
            backgroundColor: "rgba(255, 250, 240, 0.08)",
          }}
        >
          <Button
            appearance="ghost"
            accessoryLeft={PlusIcon}
            onPress={() => {
              newComp();
            }}
          >
            Lägg till en ny vara{" "}
          </Button>
        </Layout>
        <Layout
          style={{
            paddingBottom: 15,
            backgroundColor: "rgba(255, 250, 240, 0.08)",
          }}
        >
          <Button
            style={{ width: 300, alignSelf: "center" }}
            onPress={() => {
              setCreatePost(true);
            }}
          >
            {" "}
            Skapa Inlägg
          </Button>
        </Layout>
        <Modal
          visible={createPost}
          backdropStyle={styles.backdrop}
          onBackdropPress={() => setCreatePost(false)}
        >
          <Card disabled={true}>
            {myCommunitysInfo.length != 0 && (
              <Text style={tw`text-lg font-semibold text-center pb-5`}>
                Vilka grannskap vill du publicera inlägget i?
              </Text>
            )}
            {myCommunitysInfo.length == 0 && (
              <Text>
                Du måste gå med i ett grannskap för att publicera inlägget!
              </Text>
            )}
            <Divider />
            <List
              style={styles.dataBaseList}
              data={myCommunitysInfo}
              ItemSeparatorComponent={Divider}
              renderItem={printMyCommunities}
              key={giveKey}
            />

            <Layout style={{ paddingTop: 10 }}>
              <Tooltip
                anchor={renderPublishButton}
                visible={tooltipVisible}
                onBackdropPress={() => setTooltipVisible(false)}
              >
                Du måste välja ett grannskap först!
              </Tooltip>
            </Layout>
          </Card>
        </Modal>
      </Layout>
    );
  } else {
    return <BarCodeScannerComp func={barCodeActive} productInfo={product} />;
  }
};

export default CreateNewItemScreen;

const styles = StyleSheet.create({
  container: {
    height: "100%",
  },
  checkbox: {
    paddingTop: 10,
    paddingLeft: 20,
  },
  lockStyle: {
    width: 55,
    height: 55,
  },
  btn: {
    width: 75,
    height: 70,
    borderColor: "grey",
    paddingLeft: 33,
  },
  createBtn: {
    alignSelf: "center",
    width: 200,
    height: 50,
  },
  icon: {
    width: 30,
    height: 30,
  },
  container_list: {
    height: 200,
  },
  list_style: {
    backgroundColor: "red",
  },
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});
