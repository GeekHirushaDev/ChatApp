/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package socket;

import java.io.File;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.Part;

/**
 *
 * @author GeekHirusha Dev
 */
public class ProfileService {

    // work with servlet
    public boolean saveProfileImage(int userId, HttpServletRequest request) throws IOException, ServletException, ServletException {
        Part profileImage = request.getPart("profileImage");
        String appPath = request.getServletContext().getRealPath(""); //Full path of the Web Pages folder

        String newPath = appPath.replace("build" + File.separator + "web", "web" + File.separator + "profile-images");

        File profileFolder = new File(newPath, String.valueOf(userId));
        if (!profileFolder.exists()) {
            profileFolder.mkdirs();
        }

        File file1 = new File(profileFolder, "profile1.png");
        Files.copy(profileImage.getInputStream(), file1.toPath(), StandardCopyOption.REPLACE_EXISTING);

        return true;
    }

    //work with WebSocket
    public static String getProfileUrl(int userId) {
        try {
            // Check if profile image exists using the actual server URL
            URL url = new URI(ChatService.URL + "/ChatApp-Backend/profile-images/" + userId + "/profile1.png").toURL();
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("HEAD");
            conn.setConnectTimeout(5000); // 5 second timeout
            conn.setReadTimeout(5000); // 5 second timeout
            int responseCode = conn.getResponseCode();

            String profile;
            if (responseCode == HttpURLConnection.HTTP_OK) {
                profile = ChatService.URL + "/ChatApp-Backend/profile-images/" + userId + "/profile1.png";
            } else {
                profile = "";
            }
            return profile;
        } catch (IOException | URISyntaxException e) {
            e.printStackTrace();
            return "";
        }
    }
    
    
}
