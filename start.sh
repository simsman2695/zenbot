#!/bin/bash

# This script opens 50 terminal sims.

i="0"

overbought_rsi=50
oversold_rsi=50

while [ $i -lt 50 ]
do
$overbought_rsi++
$overbought_rsi--
gnome-terminal -x sh -c "./zenbot.sh  trade binanceus.BNB-USDT --paper --strategy=dip --buy_stop_pct=2 --profit_stop_enable_pct=2 --profit_stop_pct=1 --sell_pct=100 --order_adjust_time=10000 --max_sell_loss_pct=3 --markup_pct=2 --order_type=maker --days=30 --currency_capital=10000 --avg_slippage_pct=0.3 --overbought_rsi=$overbought_rsi --oversold_rsi=$overbought_rsi; bash"
i=$[$i+1]
done
