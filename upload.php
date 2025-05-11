<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_FILES['meme']) && $_FILES['meme']['error'] === 0) {
        $uploadDir = 'uploads/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $fileTmpPath = $_FILES['meme']['tmp_name'];
        $fileName = uniqid('meme_') . '.' . pathinfo($_FILES['meme']['name'], PATHINFO_EXTENSION);
        $destPath = $uploadDir . $fileName;

        if (move_uploaded_file($fileTmpPath, $destPath)) {
            echo $destPath; // retourne l’URL de l’image
        } else {
            http_response_code(500);
            echo "Erreur lors de la sauvegarde.";
        }
    } else {
        http_response_code(400);
        echo "Fichier manquant ou erreur.";
    }
} else {
    http_response_code(405);
    echo "Méthode non autorisée.";
}
?>
