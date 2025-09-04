%{
#include <stdio.h>
#include <stdlib.h>

int yylex();
void yyerror(const char *s);

// Global variable to store the result
int result;
%}

%token NUMBER
%token PLUS MINUS TIMES DIVIDE LPAREN RPAREN

%left PLUS MINUS    // Lower precedence
%left TIMES DIVIDE  // Higher precedence

%%

start:
    expr { result = $1; }
;

expr:
    expr PLUS expr   { $$ = $1 + $3; }
    | expr MINUS expr { $$ = $1 - $3; }
    | term           { $$ = $1; }
;

term:
    term TIMES term  { $$ = $1 * $3; }
    | term DIVIDE term {
        if ($3 == 0) {
            yyerror("Division by zero");
            YYABORT;
        }
        $$ = $1 / $3;
    }
    | factor         { $$ = $1; }
;

factor:
    NUMBER          { $$ = $1; }
    | LPAREN expr RPAREN { $$ = $2; }
;

%%

void yyerror(const char *s) {
    fprintf(stderr, "Error: %s\n", s);
}

int main() {
    printf("Enter an arithmetic expression (e.g., 3 + 5 * (10 - 4)):\n");
    yyparse();
    printf("Result: %d\n", result);
    return 0;
}