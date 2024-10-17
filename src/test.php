<?php

$master_hotel = null; // @TOOD get it
$to_hotel = null; // @TOOD get it

$master_imgs = [];
foreach ($master_hotel->Content->ImageGallery->Items ?? [] as $img)
	$master_imgs[$img->Remote_Blabla] = $img;
$to_imgs = [];
foreach ($to_hotel->Content->ImageGallery->Items ?? [] as $img)
	$to_imgs[$img->Remote_Blabla] = $img;

$to_delete = $master_imgs;
foreach ($to_imgs as $key => $img)
{
	$m_img = $master_imgs[$key] ?? null;
	if ($m_img)
	{
		// @TODO - update img
		
		unset($to_delete[$key]);
	}
	else
	{
		// @TODO - create img
	}
}

if (!empty($to_delete))
{
	// $to_delete now has only not-matched
	foreach ($to_delete ?? [] as $img_to_del)
		$img_to_del->setTransformState(\QIModel::TransformDelete);
	// we do the actual delete
	$master_hotel->Content->ImageGallery->save('Items');
}
