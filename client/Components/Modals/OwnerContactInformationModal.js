import { Modal, Text, Layout, Button, Card } from "@ui-kitten/components";
import { View, StyleSheet, Image } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";
import tw from "twrnc";
export const OwnerContactInformationModal = (props) => {
  const item = props.item;

  const completedTransaction = async () => {
    props.confirmTransaction(item.id);
    props.toggleRating();
  };

  const Info = () => {
    return (
      <View>
        <Text
          category={"h3"}
          style={{ marginTop: 5, marginBottom: 15, textAlign: "center" }}
        >
          Kontaktinfo
        </Text>
        {props.text}
        <View
          style={[
            styles.image,
            { alignItems: "center", justifyContent: "center" },
          ]}
        >
          <Layout style={tw`py-8`}>
            <Image
              style={[tw`rounded-full`, styles.image, { marginTop: -18 }]}
              source={{
                uri: item.imgurl,
                height: 100,
                width: 100,
              }}
            />
          </Layout>
        </View>
        <Text
          style={[
            styles.space_between,
            {
              textAlign: "center",
              fontWeight: "bold",
              fontSize: 20,
              marginTop: -15,
              marginBottom: 40,
            },
          ]}
        >
          {item.firstname} {item.lastname}
        </Text>
        <Text style={styles.space_between}>Telefonnummer: {item.number}</Text>
        <Text style={styles.space_between}>Email: {item.email}</Text>
        <Layout style={{ flexDirection: "row", marginTop: 10 }}>
          <Text category={"s1"}>Bestämt utbyte: </Text>
          <Text>
            {moment(item.time_of_expiration).format("dddd Do MMM hh:mm")}
          </Text>
        </Layout>
        <Layout
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 0,
          }}
        >
          <Button
            onPress={() => completedTransaction()}
            style={{ marginTop: 20, flex: 1 }}
          >
            <Text>Bytet är genomfört</Text>
          </Button>
        </Layout>
      </View>
    );
  };

  return (
    <Modal //Modal for additional information about a product
      visible={item.visible}
      backdropStyle={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}
      onBackdropPress={() => props.toggleModal(item)}
    >
      <Card disabled={true} style={styles.card}>
        <Info />
      </Card>
    </Modal>
  );
};

const styles = StyleSheet.create({
  card: {
    height: 450,
    width: 330,
    flex: 1,
    alignItems: "center",
    alignContent: "center",
  },
  space_between: {
    marginBottom: 8,
  },
});
