import { View, Text, Pressable } from "react-native";
import { styles } from "../../../universalStyles";
import users from "@/dbMocks/user";
import projects from "@/dbMocks/projects";
import { router } from "expo-router";
import { Project as ProjectType } from "@/dbMocks/projects";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  where,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "@/firebase";
import { useContext, useEffect, useState } from "react";

export default function Projects() {
  const user = auth.currentUser;
  const username = user?.email?.split("@")[0] || "";
  const [inProgress, setInProgress] = useState<string[][]>([]);

  useEffect(() => {
    if (user?.uid) {
      const docRef = doc(collection(db, "users"), user?.uid);
      getDoc(docRef)
        .then((uDoc) => {
          if (uDoc.exists()) {
            const data = uDoc.data();
            if (data.inProgress.length > 0 && data.inProgress[0]) {
              const projectRef = doc(
                collection(db, "projects"),
                typeof data.inProgress[0] === "string"
                  ? data.inProgress[0]
                  : data.inProgress[0].id
              );
              getDoc(projectRef).then((pDoc) => {
                if (pDoc.exists()) {
                  const pData: ProjectType = pDoc.data() as ProjectType;
                  if (pData) {
                    setInProgress([
                      ...inProgress,
                      [
                        pData.title,
                        typeof data.inProgress[0] === "string"
                          ? data.inProgress[0]
                          : data.inProgress[0].id,
                      ],
                    ]);
                  }
                } else {
                  //console.error("error: project not found");
                }
              });
            }
          } else {
            //console.error("error: user not found");
          }
        })
        .catch((error) => {
          console.error("error fetching data");
        });
    }
  }, [user]);

  const continueProject = (id: string) => {
    router.push(`/home/project/${id}`);
  };

  const createProject = async () => {
    const docRef = await setDoc(doc(collection(db, "projects")), {
      app: "VS Code",
      author: user?.uid,
      title: "not hello",
      steps: [
        {
          title: "start",
          description: "sign up",
          imageURL:
            "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fen.opensuse.org%2Fimages%2Fa%2Fa8%2FVS_Code_screenshot.png&f=1&nofb=1&ipt=ca1d56bb9cd0fe1585b88221fa54be2cedac4a0bc76a2eddb49168e683468944&ipo=images",
        },
        {
          title: "do not start",
          description: "sign up",
          imageURL:
            "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fen.opensuse.org%2Fimages%2Fa%2Fa8%2FVS_Code_screenshot.png&f=1&nofb=1&ipt=ca1d56bb9cd0fe1585b88221fa54be2cedac4a0bc76a2eddb49168e683468944&ipo=images",
        },
      ],
    });
  };
  const cancelProject = async () => {
    if (user?.uid && inProgress.length > 0) {
      try {
        const userRef = doc(collection(db, "users"), user.uid); // Clear the inProgress project in Firebase. ZO
        await updateDoc(userRef, {
          inProgress: [],
        });

        setInProgress([]); // Local is now empty. ZO

      } catch (error) {
        console.error("Error cancelling project:", error);
      }
    }
  };

  return inProgress ? (
    <View
      style={[
        styles.container,
        styles.beigeBackground,
        { paddingHorizontal: 20, paddingVertical: 40 },
      ]}
    >
      {/* Title */}
      <Text
        style={{
          fontWeight: "bold",
          fontSize: 50,
          textAlign: "center",
          marginBottom: 50,
          color: "darkblue",
        }}
      >
        Project
      </Text>

      {inProgress.length > 0 && (
        <Pressable
          style={[
            styles.button,
            { backgroundColor: "darkblue", marginBottom: 30 },
          ]}
          onPress={() => continueProject(inProgress[0][1])}
        >
          <Text style={styles.buttonTextLight}>Continue Project: {inProgress[0][0]}</Text>
        </Pressable>
      )}

      {/* Start Project Button */}
      <Pressable
        style={[
          styles.button,
          {
            backgroundColor: inProgress.length > 0 ? "#CCCCCC" : "darkblue", // Gray out if disabled
            marginBottom: 30,
          },
        ]}
        onPress={() => {
          if (inProgress.length === 0) {
            router.push({
              pathname: "/home/project/browseProjects",
              params: { app: "all" },
            });
          }
          else {
            alert("You already have a project in progress. Please finish it first!");
          }
        }}
        //disabled={inProgress.length > 0} // Disable button click if there's a project in progress
      >
        <Text style={styles.buttonTextLight}>Start Project</Text>
      </Pressable>

      <Pressable
        style={[
          styles.button,
          { backgroundColor: "darkblue", marginBottom: 30 },
        ]}
        onPress={() => router.push("/createProject")}
      >
        <Text style={styles.buttonTextLight}>Create Own Project</Text>
      </Pressable>
      {inProgress.length > 0 && (
        <Pressable style={[styles.button, {backgroundColor: "#f28b82", marginBottom: 30},]}
          onPress={cancelProject}
        >
          <Text style={styles.buttonTextLight}>Cancel Project: {inProgress[0][0]}</Text>
        </Pressable>
      )}
    </View>) : <></>;
}
