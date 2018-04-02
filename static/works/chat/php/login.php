<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2015/11/4
 * Time: 11:26
 */
session_start();
header("Content-Type:text/html;charset=gb2312");
$u=$_GET['name'];
$p=$_GET['password'];
$link=mysql_connect('localhost','root',123456);
mysql_select_db('charroom',$link);
$x=mysql_query("select*from user where name='$u' and password='$p'");
if(mysql_num_rows($x)!=0){
    $_SESSION['name']=$u;
    echo true;
}else{
    echo false;
}
?>