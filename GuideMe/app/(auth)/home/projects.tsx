import { View, Text, Pressable } from "react-native";
import { styles } from "../../universalStyles";
import users from "@/dbMocks/user"
import projects from "@/dbMocks/projects";
import { router } from "expo-router";
import { Project as ProjectType } from "@/dbMocks/projects";
import { collection, doc, getDoc, getDocs, limit, query, setDoc, where } from "firebase/firestore";
import { db } from "@/firebase";
import { AuthContext } from "@/app/_layout";
import { useContext, useState } from "react";

export default function Projects() {
  const authContext = useContext(AuthContext);
  const username = authContext?.loggedIn?.email?.split("@")[0] || "";
  const [inProgress, setInProgress] = useState<string[]>([]);
  if (inProgress.length === 0 && authContext?.loggedIn?.uid) {
    const docRef = doc(collection(db, "users"), authContext?.loggedIn?.uid);
    getDoc(docRef).then((uDoc)=>{
      if (uDoc.exists()) {
        const data = uDoc.data()
          const projectRef = doc(collection(db, "projects"), data.inProgress[0]);
          getDoc(projectRef).then((pDoc) => {
            if (pDoc.exists()) {
              const pData : ProjectType = pDoc.data() as ProjectType;
              if (pData) {
                setInProgress([pData.title, data.inProgress[0]]);
              }
            } else {
              console.error("error: project not found");
            }
          });
      } else {
        console.error("error: user not found");
      }
    });
    
  }

  const continueProject = (id : string) => {
    router.push(`/project/${id}`);
  }

  const createProject = async () => {
    const docRef = await setDoc(doc(collection(db, "projects")),
      {
        app: "VS Code",
        author: authContext?.loggedIn?.uid,
        title: "hello",
        steps: [
          {
            title: "start",
            description: "sign up",
            imageURL:
              "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fen.opensuse.org%2Fimages%2Fa%2Fa8%2FVS_Code_screenshot.png&f=1&nofb=1&ipt=ca1d56bb9cd0fe1585b88221fa54be2cedac4a0bc76a2eddb49168e683468944&ipo=images",
          },
        ],
      },);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titleBlue}>Projects</Text>
      {inProgress.length > 0 && 
      <Pressable style={styles.button} onPress={()=>continueProject(inProgress[1])}>
        <Text style={styles.buttonText}>
          Continue {inProgress[0]}
        </Text>
      </Pressable>}
      <Pressable style={styles.button} onPress={()=>router.push('/browseProjects')}>
        <Text style={styles.buttonText}>
          Start new project
        </Text>
      </Pressable>
      <Pressable style={styles.button}>
        <Text style={styles.buttonText} onPress={createProject}>
          Create project
        </Text>
      </Pressable>
      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>
          Scoreboard
        </Text>
      </Pressable>
    </View>
  );
}
