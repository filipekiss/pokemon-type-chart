<?php 
$types = ['nor' => 'Normal', 'fir' => 'Fire', 'wat' => 'Water', 'ele' => 'Electric', 'gra' => 'Grass', 'ice' => 'Ice', 'fig' => 'Fighting', 'poi' => 'Poison', 'gro' => 'Ground', 'fly' => 'Flying', 'psy' => 'Psychic', 'bug' => 'Bug', 'roc' => 'Rock', 'gho' => 'Ghost', 'dra' => 'Dragon', 'dar' => 'Dark', 'ste' => 'Steel', 'fai' => 'Fairy'];
$nor = 'roc-,gho--,ste-';
$fir = 'fir-,wat-,gra+,ice+,bug+,roc-,dra-,ste+';
$wat = 'fir+,wat-,gra-,gro+,roc+,dra-';
$ele = 'wat+,ele-,gra-,gro--,fly+,dra-';
$gra = 'fir-,wat+,gra-,poi-,gro+,fly-,bug-,roc+,dra-,ste-';
$ice = 'fir-,wat-,gra+,ice-,gro+,fly+,dra+,ste-';
$fig = 'nor+,ice+,poi-,fly-,psy-,bug-,roc+,gho--,dar+,ste+,fai-';
$poi = 'gra+,poi-,gro-,roc-,gho-,ste--,fai+';
$gro = 'fir+,ele+,gra-,poi+,fly--,bug-,roc+,ste+';
$fly = 'ele-,gra+,fig+,bug+,roc-,ste-';
$psy = 'fig+,poi+,psy-,dar--,ste-';
$bug = 'fir-,gra+,fig-,poi-,fly-,psy+,gho-,dar+,ste-,fai-';
$roc = 'fir+,ice+,fig-,gro-,fly+,bug+,ste-';
$gho = 'nor--,psy+,gho+,dar-';
$dra = 'dra+,ste-,fai--';
$dar = 'fig-,psy+,gho+,dar-,fai-';
$ste = 'fir-,wat-,ele-,ice+,roc+,ste-,fai+';
$fai = 'fir-,fig+,poi-,dra+,dar+,ste-';

$typeCluster = [];
$i = 0;
foreach($types as $key => $name) {
    $typeCluster[$i] = new stdClass;
    $strengths = explode(',', $$key);
    $typeCluster[$i]->name = $name;
    $typeCluster[$i]->immunes = [];
    $typeCluster[$i]->weaknesses = [];
    $typeCluster[$i]->strengths = [];
    foreach($strengths as $strength) {
        if (stristr($strength, '--')) {
            $typeCluster[$i]->immunes[] = $types[str_replace('--', '', $strength)];
            continue;
        }
        if (stristr($strength, '-')) {
           $typeCluster[$i]->weaknesses[] = $types[str_replace('-', '', $strength)];
            continue;
        }
        if (stristr($strength, '+')) {
            $typeCluster[$i]->strengths[] = $types[str_replace('+', '', $strength)];
            continue;
        }
    }
    $i++;
}
echo json_encode($typeCluster);