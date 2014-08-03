<?php

$path = $_GET['path'];
$count = intval($_GET['count']);

if(!file_exists($path) || !($count>0)) die('error');

$output = "";

$dir = '';

$cache_path = $path.'_cache_'.$count;

$ignore_cache = $_GET['ignore_cache'];





if (file_exists($cache_path) && !isset($ignore_cache)) {
	//header('location:' . $cache_path);
	echo file_get_contents($cache_path);
	die();
}


for ($i = 0; $i < $count; $i++) {

	$file_path = $dir . $path . '/' . $i . '.jpg';
	$file_get_contents = file_get_contents($file_path, FILE_USE_INCLUDE_PATH);
	$file_encode = base64_encode($file_get_contents);
	$output .= "$file_encode\n__END__";
	//
}

//$output = "String de test";
//$compress = gzdeflate($output);

file_put_contents($cache_path, $output);


header('Content-Length: '.filesize($cache_path));
echo $output;

