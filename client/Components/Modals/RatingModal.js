import { Button, Card, Modal, Text, useTheme } from "@ui-kitten/components";
import { StyleSheet, View } from "react-native";

import StarRating from "react-native-star-rating";
import { updateRating } from "../../Services/ServerCommunication";
import { useState } from "react";

export const RatingModal = (props) => {
  //STATE
  const [starRating, setStarRating] = useState(3);

  const item = props.item;
  const theme = useTheme();

  const ratingComplete = async () => {
    await updateRating(item.responder_id, starRating);
    props.ratingCompleted();
  };

  const onStarRatingPress = (newRating) => {
    setStarRating(newRating);
  };

  const Info = () => {
    return (
      <View>
        <Text category={"h2"} style={{ marginTop: 60 }}>
          Betygsätt utbytet
        </Text>

        <StarRating
          containerStyle={{ marginTop: 100 }}
          disabled={false}
          maxStars={5}
          fullStarColor={theme["color-primary-500"]}
          emptyStarColor={theme["color-primary-500"]}
          rating={starRating}
          selectedStar={(rating) => onStarRatingPress(rating)}
        />

        <Button onPress={() => ratingComplete()} style={{ marginTop: 100 }}>
          <Text>Ge omdöme</Text>
        </Button>
      </View>
    );
  };

  return (
    <Modal //Modal for additional information about a product
      visible={item.visible}
      backdropStyle={{ backgroundColor: "rgba(0, 0, 0, 0.25)" }}
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
    alignContent: "center",
    alignItems: "center",
  },
});
