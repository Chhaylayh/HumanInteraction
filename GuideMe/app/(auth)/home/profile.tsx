import {
  Pressable,
  Text,
  View,
  FlatList,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import { router, useGlobalSearchParams } from "expo-router";
import { styles } from "../../universalStyles";
import { auth, db } from "@/firebase";
import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  arrayUnion,
  query,
  where,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { User } from "@/dbMocks/user";
import { type Project, type Projects as ProjectType } from "@/dbMocks/projects";
import { Ionicons } from "@expo/vector-icons";

interface ItemProps {
  title: string;
  image: string;
  background: string;
}

{
  /* array that contains all suggested app info */
}
const DATA = [
  {
    id: "1",
    title: "ChatGPT",
    background: "lightgreen",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/2048px-ChatGPT_logo.svg.png",
  },
  {
    id: "2",
    title: "VS Code",
    background: "lightblue",
    image:
      "https://tidalcycles.org/assets/images/vscodeicon-42dc264fde2adb74cc197fe6d02b183c.png",
  },
  {
    id: "3",
    title: "Microsoft Excel",
    background: "green",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Microsoft_Office_Excel_%282019%E2%80%93present%29.svg/826px-Microsoft_Office_Excel_%282019%E2%80%93present%29.svg.png",
  },
  {
    id: "4",
    title: "Discord",
    background: "darkblue",
    image:
      "https://static.vecteezy.com/system/resources/previews/023/741/066/non_2x/discord-logo-icon-social-media-icon-free-png.png",
  },
  {
    id: "5",
    title: "Miscrosoft Teams",
    background: "#B19CD9",
    image:
      "https://www.thomas-krenn.com/redx/tools/mb_image.php/ct.ZHmFQ/cid.y04aedfd415189e63/Microsoft_Teams.png",
  },
];

{
  /* item display */
}
const Item: React.FC<ItemProps> = ({ title, image, background }) => (
  <View
    style={[
      styles.item,
      {
        width: 150,
        marginRight: 20,
        backgroundColor: background,
        borderRadius: 10,
      },
    ]}
  >
    <Pressable
      onPress={() => {
        router.push({
          pathname: "/home/project/browseProjects",
          params: { app: title },
        });
      }}
    >
      <Image
        source={{ uri: image }}
        style={{ width: 100, height: 100, marginBottom: 10 }}
        resizeMode="cover"
      />
      {/* <Text style={[styles.itemText, { alignSelf: "center"}]}>{title}</Text> */}
    </Pressable>
  </View>
);

export default function Profile() {
  const user = auth.currentUser;
  const name = user?.email?.split("@")[0];
  const [userData, setUserData] = useState<User>();
  const [finishedProjectIds, setFinishedProjectIds] = useState<string[]>([]);
  const [projects, setProjects] = useState<ProjectType>({});
  const [isAnyProjectInProgress, setIsAnyProjectInProgress] =
    useState<boolean>(false);
  const { app } = useGlobalSearchParams();

  useEffect(() => {
    if (user?.uid) {
      const docRef = doc(collection(db, "users"), user?.uid);

      getDoc(docRef).then((uDoc) => {
        if (uDoc.exists()) {
          setUserData(uDoc.data() as User);
        }
      });

      const fetchProjects = async () => {
        let result;
        if (app && app !== "all") {
          result = await getDocs(
            query(collection(db, "projects"), where("app", "==", app))
          );
        } else {
          result = await getDocs(collection(db, "projects"));
        }

        const newData: ProjectType = {};
        result.docs.forEach((doc) => {
          newData[doc.id] = doc.data() as Project;
        });
        setProjects(newData);
      };
      const fetchUserFinishedProjects = async () => {
        const user = auth.currentUser;
        if (user) {
          const userRef = doc(collection(db, "users"), user.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            const finishedProjects = userData.finishedProjects || [];
            // fetch the finishedProjects and store them in map for filtering. ZO
            setFinishedProjectIds(
              finishedProjects.map((p: { id: string }) => p.id)
            );

            // check for projects in progress. ZO
            const inProgress = userData.inProgress || [];
            setIsAnyProjectInProgress(inProgress.length > 0);
          }
        }
      };
      fetchProjects();
      fetchUserFinishedProjects();
    }
  }, [user, app]);

  // filter out finished projects from projects list. ZO
  const filteredProjects = Object.keys(projects).filter((key) =>
    finishedProjectIds.includes(key)
  );

  const navToProject = (id: string) => {
    const user = auth.currentUser;
    const userRef = doc(collection(db, "users"), user?.uid);
    updateDoc(userRef, {
      inProgress: arrayUnion({ id: id, step: 0 }),
    });
    router.push(`/home/project/${id}`);
  };
  const getAppImage = (appName: string) => {
    const appImages: { [key: string]: string } = {
      "VS Code":
        "https://tidalcycles.org/assets/images/vscodeicon-42dc264fde2adb74cc197fe6d02b183c.png",
      ChatGPT:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/2048px-ChatGPT_logo.svg.png",
      Discord:
        "https://static.vecteezy.com/system/resources/previews/023/741/066/non_2x/discord-logo-icon-social-media-icon-free-png.png",
      "Microsoft Excel":
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Microsoft_Office_Excel_%282019%E2%80%93present%29.svg/826px-Microsoft_Office_Excel_%282019%E2%80%93present%29.svg.png",
    };
    return appImages[appName];
  };

  return (
    userData ? (
      <View
        style={[
          styles.container,
          styles.beigeBackground,
          { paddingHorizontal: 20 },
        ]}
      >
        <Ionicons name="person-circle" size={100} color="darkblue"/>
        <Text
          style={[styles.titleBlue, { fontSize: 40, marginBottom: 5, alignSelf: "center" }]}
        >
          {name}
        </Text>
        {userData.accountDate ? (
            <Text
              style={[styles.itemText, { color: "darkblue", marginBottom: 10 }]}
            >
              GuideMe user since{" "}
              {new Date(userData.accountDate).toLocaleString()}
            </Text>
        ) : null}
        <Text style={[styles.titleBlue, { fontSize: 24, marginTop: 20, marginBottom: 10 }]}>
          {name}'s GuideMe Stats
        </Text>
        <Text style={[styles.buttonTextLight, { color: "darkblue", fontSize: 20, marginBottom: 2 }]}>
          {userData.score} Points
        </Text>
        <Text style={[styles.buttonTextLight, { color: "darkblue", fontSize: 20, marginBottom: 2 }]}>
          {userData.finishedProjects && userData.finishedProjects.length}{" "}
          Finished Projects
        </Text>
        <Text style={[styles.buttonTextLight, { color: "darkblue", fontSize: 20, marginBottom: 2 }]}>
          {userData.contributed.length} Contributed Projects
        </Text>

        {userData.finishedProjects.length ? <Text style={[styles.titleBlue, { fontSize: 24, marginTop: 20, marginBottom: 10 }]}>
        {name}'s Finished Projects
        </Text> : null}
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {filteredProjects.map((key, i) => (
            <Pressable
              key={i}
              style={[
                styles.button,
                {
                  marginVertical: 10,
                  width: 350,
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 10,
                  backgroundColor: isAnyProjectInProgress
                    ? "#CCCCCC"
                    : "darkblue",
                },
              ]}
              onPress={() => {
                if (!isAnyProjectInProgress) { // only want one project at a time. alert if tapped again. ZO
                  navToProject(key);
                } else {
                  alert("You already have a project in progress. Please finish it first!");
                }
              }}
            >
              <Image
                source={{ uri: getAppImage(projects[key].app) }}
                style={{ width: 50, height: 50, marginRight: 15 }}
                resizeMode="contain"
              />
              <Text style={[styles.buttonText, { flex: 1 }]}>
                {projects[key].title}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        <Pressable
          style={[styles.button, { position: "absolute", bottom: 20 }]}
          onPress={() => {
            signOut(auth)
              .then(() => {
                router.dismissAll();
                router.replace("/login");
              })
              .catch((error) => {
                Alert.alert(
                  "There was a problem signing you out. Please try again."
                );
              });
          }}
        >
          <Text style={styles.buttonText}>Log Out</Text>
        </Pressable>
      </View>
    ) : null
  );
}
