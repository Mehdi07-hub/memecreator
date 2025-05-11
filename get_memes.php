<?php
$dir = 'uploads/';
$memes = [];

if (is_dir($dir)) {
    $files = scandir($dir);
    foreach ($files as $file) {
        if ($file !== '.' && $file !== '..') {
            // Filtrer uniquement les fichiers images
            $extension = pathinfo($file, PATHINFO_EXTENSION);
            if (in_array(strtolower($extension), ['jpg', 'jpeg', 'png', 'gif'])) {
                $memes[] = $dir . $file;
            }
        }
    }
}

header('Content-Type: application/json');
echo json_encode($memes);
?>
