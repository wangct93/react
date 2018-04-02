<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2015/11/4
 * Time: 11:50
 */
session_start();
header("Content-Type:text/html;charset=utf8");
$c=$_GET['content'];
$n=$_SESSION['name'];
$t=date('Y-m-d h:i:s',mktime());
$link=mysql_connect('localhost','root',123456);
mysql_select_db('charroom',$link);
mysql_query("insert into message(time,name,content) values('$t','$n','$c')",$link);
$x=array('time'=>$t,'name'=>$n,'content'=>$c);
echo preg_replace("#\\\u([0-9a-f]+)#ie", "iconv('UCS-2', 'UTF-8', pack('H4', '\\1'))", json_encode($x));
?>