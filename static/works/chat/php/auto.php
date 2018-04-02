<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2015/11/4
 * Time: 11:55
 */
session_start();
header("Content-Type:text/html;charset=utf8");
$link=mysql_connect('localhost','root',123456);
mysql_select_db('charroom',$link);
$x=mysql_query("select*from message",$link);
$b=array();
$index=0;
while($y=mysql_fetch_row($x)){
    $b[$index++]=array('name'=>$y[1],'time'=>$y[0],'content'=>$y[2]);
}
echo preg_replace("#\\\u([0-9a-f]+)#ie", "iconv('UCS-2', 'UTF-8', pack('H4', '\\1'))", json_encode($b));

?>